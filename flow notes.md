# Flow - A Visual Programming Language

## First Thoughts

- Only one fundamental data type: byte
- Only one fundamental control structure: circuit (nand?)
- Multiple derived types:
  - Numbers (rationals, etc.)
  - I/O (streams)
  - Characters/strings
  - Booleans
- Multiple derived circuits:
  - if/choose
  - concat
  - math (sum, product, etc.)
- All processing is asynchronous by default ('queue-based' instead of 'stack-based'); circuits block until all their inputs are ready (aka non-null, see below)
- All looping is implicit via recursion--either redirecting a circuit's output to one of its own inputs (tail-recursive), or embedding a copy of itself or an 'ancestor' (non-tail-recursive)
  - To support this, recursive inputs will need special handling--something like a 'default' or 'initial' value that supplies input only until/unless it's overridden
    - This doesn't have to be a recursion-specific feature, there are probably lots of other cases where it would be useful
    - There could be multiple 'defaults', with later ones taking priority
- Circuit literals:
  - List of 'addresses', with arrows indicating direction (I vs. O)? (Addresses = variable names; some internal, some external.) Initialize addresses at top of circuit; each one references a 'template' that gets copied. (Create your own templates...how?)

## Syntax

Grammar below is for JSON-compliant 'internal' syntax, rarely used directly

Compiles ('assembles') to/from intermediate representation that preserves the
structure, but loosens the syntax requirements for readability and convenience

Comment character is '#', multiline comments with '###...###' ('//' is an empty regex literal)

TODO: position, designating circuits (or circuit refs) as templates, distinguishing circuit names from template names (initial capital?), resolving ambiguity when referencing ancestor (or whatever) circuits, defining non-source-order priority for defaults (maybe? keeping it source-order isn't much different than variable shadowing, after all)

```text
program -> '{ "Core":' circuitLiteral '}'
circuitList -> variable ':' circuit [ ',' circuitList ]

circuit -> templateRef | circuitLiteral
templateRef -> '"' templatePath '"'
templatePath -> varChars [ '.' templatePath ]

variable -> '"' varChars '"'
varChars -> alpha [ alphaNumeric ]
alpha -> /[a-zA-Z_]/
numeric -> /[0-9]/
alphaNumeric -> ( alpha | numeric ) [ alphaNumeric ]

circuitLiteral -> '{' subcircuits ',' connections '}' | null
subcircuits -> '"chips": {' [ circuitList ] '}'
connections -> '"wires": {' [ pairList ] '}'

pairList -> input ':' output [ ',' pairList ]
input -> primitive | templateRef | endpoint
output -> endpoint | null
endpoint -> '"' varChars '>>' varChars '"'
primitive -> '"&' number | boolean | regex | string | null '"'
number -> numeric [ '.' numeric ]
boolean -> 'true' | 'false'
regex -> '/' string '/'
string -> escapedChar [ string ]
escapedChar -> notAQuoteOrSlash | '\' ( '\' | '/' | '"' )

null -> 'null' | '{}'
```

Example program using 'assembly' syntax:

```text
# outermost "global" circuit is mostly implicit
# {
#   Core: {
chips: {
#     built-in circuits,
CircuitAddress: { # TemplateName?
  chips: { # components?
    fullSyntax: {
      ref: templateOrAddressOrLiteral,
      pos: [x, y, z], # all default to 0, but must be in this order
      otherFields: ?,
    },
    shorthandSyntax: [ref, x, y, z, ...],
    nameEqualsRefShorthand: [x, y, z, ...],
    allDefaultsShorthand: ref,
    combinedShorthand,
    # ------------------------------------------------------------- #
    innerAddress: templateName, # creates a copy (a la class/prototype)
    circuitName, # references an ancestor (any?) circuit directly (sort of like an import; implies possible recursion)
    # wait, should this even exist? the 'state' of ancestor circuits should be unmodifiable, since they've already run (and if you need that state, you should simply pass it to the child circuit as input), and if you do change the state, it's now a copy and not a 'direct' reference
    # maybe this is just a shorthand for passing state from ancestor to child, without having to create a bunch of intermediary endpoints?
    # I suppose state could also go from child to parent, but what advantage would that have over a template?
    # perhaps there could also be a shorthand that means "whatever input such-and-such circuit got the last time it ran, give so-and-so circuit that same input as defaults"?
    # ------------------------------------------------------------- #
    circuitLiteral: {
      chips: { ... },
      wires: { ... },
    },
    ...
  },
  wires: {
    source>>outputName::inputName>>destination, # all wires follow this general form
    source >> outputName :: inputName >> destination , # optional WS
    source >> ouputName::inputName >> destination, # recommended style (?)

    # comparing alternative syntaxii: ----------------------------- #
    src out::in dst,   # ? do I even need the circuit separators? Maybe only to resolve ambiguity? (src out: dst, src :in dst, src >>:in dst, src >> dst, )
    src:out in:dst, # src out: dst, src :in dst, src::dst, chp >> dst, chp >> :in dst, :>in rcr out:>,
    ###
    src out::in dst;
    src@out::in@dst;
    src :in dst;
    chp@ :in dst;
    src ::in dst;
    src :: dst;
    this (a:, b:) + (::, 2) ** ('The squared sum is ', ::, ', dawg.') :words this;
    this isButtered:: not (::condition, n@@) incWhile (@@result, result::, this butterAmount::) * (|quantity|, ::howMuchButter this);
    bread isToasted:: choose (isTrue::startButtering bread, quantity@ :butter bread, bread@ :toast this, isFalse::startToasting toaster, bread@ :: toaster);
    
    src:out >> in:dst, # disambiguated
    src:out in:dst, # equivalent^
    chp >> in:dst, # chip as signal 
    chp >> dst, # anonymous inpoint
    src:out dst, # non-meta version
    src in:dst, # anonymous outpoint
    src::dst, # also `src: :dst`, `src: >> :dst`
    in:>> rcr >>:out,
    this (:a, :b) + (::, 2) ** ('The squared sum is ', ::, ', dawg.') words:this,
    this:isButtered not (condition:, n:>) incWhile (:>result, :result, this:butterAmount) * (|quantity|, howMuchButter:this);
    bread:isToasted choose (:isTrue startButtering:bread, quantity butter:bread, bread toast:this, :isFalse startToasting:toaster, bread:toaster);
    ###
    
    src.out::in.dst,   # % easy to type, intuitive to experienced programmers, but the shorthands are difficult to read at a glance; might be better for disambiguating ancrefs
    src>out::in>dst,   # X ambiguity with comparison
    src->out::in->dst, # % tricky to type
    src..out::in..dst, # % somewhat better than just one, but still ugly
    src>>out::in>>dst, # * very easy to type, ambiguous with bit shift operator (but that will be moot if there are none), much more readable now that I've modified the recursive shorthand (>>::>>, >>out::>>dst, src>>::>>dst, >>out::in>>, in>>crt>>out, in>>crt>>, >>crt>>)
    src:>out::in:>dst, # ! somewhat less easy to type, a bit less readable, but looks 20% cooler (in:>crt:>, :>crt:>out, :>crt:>, src:>:::>dst, :>out::in:>dst)
    src>:out::in>:dst, # % not sure why I think circuit:>endpoint is better than circuit>:endpoint, but I do (maybe 'cause it looks more like an arrow?)
    src=>out::in=>dst, # * speaking of arrows, also not sure why I'm resisting the obvious. Just to be different? Tricky to type, but not for *me*, and it clearly hasn't hurt other languages.
    # src=>::=>dst, =>out::in=>, =>crt=>, in=>crt=>, =>crt=>out
    src.>out::in.>dst, # % about as easy as :>, looks very weird to someone used to traditional operators, possible ambiguity with comparison
    # ------------------------------------------------------------- #

    all>>wires::useInternal>>addresses, # circuits are only in control of wires inside themselves, not to other circuits
    # conversely, no circuit can change another's wires (i.e. all wires are private)
    42::number>>giveMeLiterals, # "primitive" literals are circuits (all singletons, theoretically) that output themselves and have no inupts...
    { chips: { ... }, wires: { ... } } :: anonymousCircuit>>giveMeLiterals # although non-primitives can also output themselves!
    "Here is a string literal."::string>>giveMeLiterals,
    /here is a regular expression/::regex>>giveMeLiterals,
    true::isBoolean>>giveMeLiterals,
    null::nuthinHere>>giveMeLiterals, # null (also written '{}') is a primitive representing the empty circuit: it has no endpoints, so  it can only output itself
    # (null is the default for all unused endpoints, so its only use in wires is for overriding another source/destination)
    giveMeLiterals>>ignored::{}, # normally, using a circuit instead of an endpoint as a destination is an error, but null is an exception (it ignores all input)
    this::anotherCircuit>>giveMeLiterals # the special literal 'this' is used to send the circuit itself to an endpoint...
    this>>outpointName::inpointName>>this, # as well as to define (and reference) the circuit's own endpoints
    >>ownInpointName::ownOutpointName>>, # 'this' can be omitted...
    singleOutputCircuit>>::>>singleInputCircuit, # and so can the endpoints of circuits with only one input/output...
    wholeEntireCircuit::[endpoint>>?]maybeCircuitMaybeEndpoint[>>circuit?], # but the separator is not optional (as a source, it takes the entire circuit as input; as a destination, it may be ambiguous)
    this>>isNotRecursion::itsJustIdentity>>this, # there is no way for circuits to recurse on themselves directly (that would mean defining wires outside the circuit)
    thisIsRecursion>>output::input>>thisIsRecursion, # recursion of a child circuit is allowed, of course...
    input>>recursiveCircuit>>output, # and even has its own shorthand syntax...
    input>>simpleRecursiveCircuit>>, # which can be even shorter if the circuit only has one output...
    >>otherSimpleRecursion>>output, # or input...
    >>simplestRecursiveCircuit>>, # or both
    sender:>receiver ( # shorthand for defining multiple wires between the same two components...
      throw::catch,
      kick::miss,
      tackle::fumble
    ),
    sender:>receiver ( # even shorter when the endpoints share a name...
      pass,
      hike,
      handoff
    ),
    sender:>receiver ( # sending the same output to multiple inputs...
      throw:: (catch, miss, fumble)
    ),
    sender:> ( # or circuits...
      throw:: (
        catch>>beeQueue,
        miss>>looseStart,
        fumble>>arcFronter
      )
    ),
    sender:>receiver ( # or vice versa
      (throw, kick, tackle) ::touchdown
    ),
    sender:> ( # can be combined in various ways (?)
      throw::catch>>looseStart,
      :>beeQueue (
        kick::miss,
        tackle::fumble
      )
    ),
    ( # however, this syntax is NOT supported, both because a circuit's outputs should be fairly encapsulated, (sort of like a function's multiple callers/one return value), and because I find this very difficult to read at a glance and can't think of a better syntax
      beeQueue>>throw,
      arcFronter>>kick
    ) ::catch>>receiver,
    ...
  },
},
anotherUserDefinedCircuit: { ... },
...
},
wires: {
  # built-in wires, (?)
  wires>>between::builtIn>>circuits,
  and>>or::userDefined>>circuits,
  ...
}
#   }
# }
```

## Use

```text
# do I really need separate sections for chips and wires, or can they be differentiated syntactically?
# maybe the chips/imports could just be a big multiplexer? so a circuit would be { ( literalOrAncRefOrSomething
      => localName,
    ...
) 
some >> wires: >> iGuess, ... }

Chip :variable:,
{ ### very
  large
  chip ###
} :variable:,

{::}, # identity (anonymous)
{:endpoint:}, # identity with named endpoint(s)
||, # also identity
|name|, # named identity chip

# assignment/aliasing/naming (only chips can have names, not wires)
variable<=>chip,
variable:=:chip,
variable:=chip,
variable=>chip,
variable=:chip,
variable=chip,
chip >> |variable|,
chip:output |variable|;
singleton |variable|;
src:out |name| in:dst;

(this.?)name: ofCircuit, # chip
circuitRef :name >> ofInpoint, # wire
literal singleton, # wire
literal singleton anotherSingleton, # wire chain
(plex, er) indexedCircuit # 'indexed' circuits have a variable number of endpoints that are numbered, not named (plexers themselves are indexed circuits)
# technically it's the chip's endpoints that are indexed, not the chip itself, so there are three kinds: indexed-in, indexed-out, and bi-indexed
[
  'Hello, world!' core.print,
  core.console |name|,
  ('Hello, ', :name, '!') core.print,
  core.console >> userString: |name|,
  ('Hello, ', name:, '!') :>> core.console,
  (5, 3) + :> |sum|,
  sum core.print,
  (sum, 2) ** :> core.print,
  ('hel', 'f') munge |h, elf|
]
```

## Implementation

```javascript
{
"choose": {
  chips: {
    if: op("choose")
  },
  wires: {
    this :> if (
      condition::0,
      ifTrue::1,
      ifFalse::2
    ),
    if >> return::result >> this
  }
}
}
```
