# Flow - A Visual Programming Language

## TODO

- Move this mess to its own repo and organize it

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
- [Block Protocol?](https://blockprotocol.org/)

## Formal Grammar

Grammar below is for JSON-compliant 'internal' syntax, rarely used directly

Compiles ('assembles') to/from intermediate representation that preserves the structure, but loosens the syntax requirements for readability and convenience

```text
program -> '{ "core":' circuitLiteral [ ',' circuitList ] '}'
circuitList -> variable ':' circuit [ ',' circuitList ]

circuit -> templateRef | circuitLiteral
templateRef -> '"' templatePath '"'
templatePath -> varChars [ '.' templatePath ]

variable -> '"' varChars '"'
varChars -> alpha [ alphaNumeric ]
alpha -> /[a-zA-Z_]/
numeric -> /[0-9]/
alphaNumeric -> ( alpha | numeric ) [ alphaNumeric ]

circuitLiteral -> '{' circuitList ',' connections '}' | null
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

## Syntax

Comment character is `#`, multiline comments with `#>...>#` (`//` is an empty regex literal)

### Syntax TODO

- position
- appearance
- designating circuits (or circuit refs) as templates
- distinguishing circuit names from template names (initial capital? no difference?)
- resolving ambiguity when referencing ancestor (or whatever) circuits
- defining non-source-order priority for defaults
  - (maybe? keeping it source-order isn't much different than variable shadowing, after all)
- 'blueprint' instead of 'template'
- only one wire per inpoint rule?
  - Pros: makes syntax easier (e.g. no many-to-one shorthand), eliminates complexity of automatic defaults, easy to tell computationally when it's being violated
  - Cons: difficult to tell visually when it's being violated, increases complexity when defaults are needed (i.e. dedicated core circuit with unique evaluation rules)
- variable number of inpoints

### Example

```text
# all .flw files are implicitly circuit literals
# {
spam:, # 'libraries' are just circuits, but the wires (if any) are ignored
ham: `./some/directory/ham.flw`, # load circuit from file (defaults to `./` a.k.a. ``)
bacon: `beans`, # load './beans.flw' as 'bacon'
maps: { ... }, # libraries can be inlined...
snaeb: spam.deeply.nested.library, # and aliased
# implicit (predefined) global circuits,
core: { # circuits with a 'core' chip are called 'programs' and can be executed (circuits without don't have an 'entry point' and are either templates, libraries, or both)
# P.S. core is the only library that can be used without being declared, since a circuit can't be toplevel without it
  # global circuits and libraries can be referenced 'bare' (spam) or with a leading period (.spam)
  eggs:, # imports can be nested, and are referenced accordingly (e.g. core.eggs.TemplateName)
  # implicit core circuits (mostly I/O),
  TemplateName: {
    fullSyntax: {
      ref: templateOrAddressOrLiteral,
      pos: [x, y, z], # all default to 0, but must be in this order
      vis: <???>, # visual representation, defaults to (string literal? (HTML?) invisible?)
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
    CircuitLiteral: {
      ...,    # chips
      [ ... ] # wires
    },
    ...
    [
      source>>outputName::inputName>>destination, # all wires follow this general form
      source >> outputName : : inputName >> destination , # optional WS
      source >> ouputName::inputName >> destination, # recommended style ("separated circuits, connected endpoints")
      circuit :inpoint >> dest, # circuit as output (note missing : for 'empty' outpoint)
      source >> :inpoint >> dest, # a circuit with only one endpoint can also (optionally) leave it empty
      circuit :>> dest # putting them together
      source :> dest, # when wiring two singletons together -- can also be written '>>::>>' (see 'when endpoints share a name' below), but *not* '>> >>' (that's just gross)
      >> outpoint::inpoint >>, # implicit 'this' (?)
      enter >> outpoint::inpoint >> exit # alternative to 'this' (may be necessary, with wire chaining?)
      source >>:endpoint:>> dest, # when endpoints share a name (not sure about style yet)
      source >> crummyName = betterName: ( ... ), # alias an endpoint
      source >> =betterName: ( ... ) # alias a singleton endpoint
      ( ... ) :betterName = otherCrummyName >> dest # de-alias
      ( ... ) :betterName= >> dest # singleton de-alias
      source >> outpoint = coolName: ( coolName::nameCool ) :nameCool = inpoint >> dest # putting them together
      :inpoint >> recursiveCircuit >> outpoint:, # recursive shorthand
      :>> simpleRecursion >>:, # shorterhand

      # comparing alternative syntaxii: ----------------------------- #
      src->out in+>mid->out in+>dst; # *
      
      src:out => in:dst;
      src:out -> in:dst;
      src:out >> in:dst;
      src out::in dst,   # ? do I even need the circuit separators? Maybe only to resolve ambiguity? (src out: dst, src :in dst, src >>:in dst, src >> dst, )
      # src@out::in@dst; chp@ :in dst; src ::in dst; src :: dst;
      src:out in:dst, # src out: dst, src :in dst, src::dst, chp >> dst, chp >> :in dst, :>in rcr out:>,
    
      src >> out==in >> dst, # ! seems less readable than ::, but maybe that's just because I'm used to it? (src >>==>> dst, >> out==in >>, =>> crt >>=, =in >> crt >> out=)
      src => out::in => dst, # * not sure why I'm resisting the obvious. Just to be different? Tricky to type, but not for *me*, and it clearly hasn't hurt other languages. (src =>::=> dst, => out::in =>, :=> crt =>:, :in => crt =>:, :=> crt => out:)

      src >> out:=:in >> dst, # ! more characters, but looks cooler
      src >> out<=>in >> dst, # % eh

      src:>out::in:>dst, # % somewhat less easy to type, a bit less readable, but looks 20% cooler (in:>crt:>, :>crt:>out, :>crt:>, src:>:::>dst, :>out::in:>dst)
      src.out::in.dst,   # X easy to type, intuitive to experienced programmers, but the shorthands are difficult to read at a glance; might be better for disambiguating ancrefs
      src->out::in->dst, # X tricky to type
      src..out::in..dst, # X somewhat better than just one, but still ugly
      src>:out::in>:dst, # X not sure why I think circuit:>endpoint is better than circuit>:endpoint, but I do (maybe 'cause it looks more like an arrow?)
      src.>out::in.>dst, # X about as easy as :>, looks very weird to someone used to traditional operators, possible ambiguity with comparison
      src>out::in>dst,   # X ambiguity with comparison
      # ------------------------------------------------------------- #

      all >> wires::useInternal >> addresses, # circuits are only in control of wires inside themselves, not to other circuits
      # conversely, no circuit can change another's wires (i.e. all wires are private)

      42 :number >> giveMeLiterals, # "primitive" literals are circuits (all singletons, theoretically) that output themselves and have no inupts...
      { ... } :anonymousCircuit >> giveMeLiterals # although non-primitives can also output themselves!
      "Here's a string literal." :string >> giveMeLiterals,
      'You can also "write" strings like this.' :otherString >> giveMeLiterals,
      """Here's a "raw" string literal.
      It can be multiline,
      and backslashes (\, \\, \n, etc.)
      are treated literally.""" :rawString >> giveMeLiterals,
      /here is a regular expression/ :regex >> giveMeLiterals,
      `this/is/a/file.literal` :file >> giveMeLiterals,
      true :isABoolean >> giveMeLiterals,
      null :meansNuthinHere >> giveMeLiterals, # null (also written '{}') is a primitive representing the empty circuit; it has no endpoints, so it can only output itself
      # (null is the default for all unused endpoints, so its only use in wires is for overriding another source/destination)
      giveMeLiterals >> ignored: {}, # normally, using a circuit instead of an endpoint as a destination is an error, but null is one exception (it ignores all input) (plexers are the other exception)

      <>Here is an HTML literal!</> :html >> giveMeLiterals, # any non-empty tag (e.g. <p>...</p>, <br/>) also works
      <!>This HTML literal will be deployable on write.</!> :bangHtml >> giveMeLiterals, # HTML literals with the <!></!> tag will be implicitly wrapped with the Emmet '!' expansion
      <() {
        const literal = require('./javaScript')
        return literal(42)
      }> :js >> giveMeLiterals, # javascript can also be inlined, and is equivalent to a circuit literal with one outpoint named 'return'
      # <() { return 42 }> >> :theAnswer >> inquiringMinds
      <(param1, param2) { ... }> :jsWithParams >> giveMeLiterals, # js literals are implicitly wrapped in an IIFE and can accept parameters as inpoints with the same names

      # The special form ( a, b, c ) -- a.k.a. 'plexer' -- is syntactic sugar that makes it easier to wire up chips (including js literals) with multiple endpoints, like so:
      ( 42, 'helf' ) >> <(param1, param2) { ... }>,
      # or: [] = plexer, () = mini-circuit? (as in, shorthand for special case of small and/or one-off circuits) (and/or maybe 'namespace'?)

      ### list of chips...
      consoleAlias: core.console,
      somePlexer: (),
      ...
      [
        42 :0 >> somePlexer, ' is the answer!' :1 >> somePlexer, somePlexer >> :0: >> consoleAlias, somePlexer >> :1: >> consoleAlias
      ] # non-sugared plexer
      ###
      ( 42 :first, ' is the answer!' :second ) >> weirdArray :> core.console # semi-sugared (necessary for named, rather than anonymous or numbered, endpoints)
      ( 42, ' is the answer!' ) >> core.console # fully-sugared

      'Hello, world!' :>> core.console, # good ol' hello world
      core.console >> =name: ('Hello, ', name:, '!') >> core.console, # wires can be chained, chains are separated by commas

      <[
        body {
          background-color: lightblue;
        }
      ]> :css >> giveMeLiterals, # css can also be inlined...
      <{
        js...
      }
      [
        css...
      ]>
        html...
      </> :markedUpHtml >> giveMeLiterals, # and both can be combined with html
      # (with marked-up html, the js and css are embedded with <script></script> and <style></style> tags, respectively)

      this :thisVeryCircuit >> giveMeLiterals # the special literal 'this' is used to send the circuit itself to an endpoint...
      this >> outpointName::inpointName >> this, # as well as to define (and reference) the circuit's own endpoints
      >> ownInpointName::ownOutpointName >>, # 'this' can be omitted...
      singleOutputCircuit >>::>> singleInputCircuit, # and so can the endpoints of circuits with only one input/output (also written ':>')...
      wholeEntireCircuit ::[endpoint? >> ]maybeCircuitMaybeEndpoint[ >> circuit?], # but the >> separator is not optional (as a source, leaving it out makes the entire circuit the input; as a destination, it could be ambiguous)
      this >> isNotRecursion::itsJustIdentity >> this, # there is no way for circuits to recurse on themselves directly (that would mean defining wires outside the circuit)
      recursiveCircuit >> output::input >> recursiveCircuit, # recursion of a child circuit is allowed, of course...
      :input >> recursiveCircuit >> output:, # and even has its own shorthand syntax...
      :input >> simpleRecursiveCircuit >>:, # which can be even shorter if the circuit only has one output...
      :>> otherSimpleRecursion >> output:, # or input...
      :>> simplestRecursiveCircuit >>:, # or both (though there wouldn't be much point to this, unless the circuit had side effects or the inpoint had defaults)
      sender >> ( # plexers can help with defining multiple wires from the same chip...
        throw::catch >> beeQueue,
        kick::miss >> looseStart,
        tackle::fumble >> arcFronter
      )
      sender >> ( # and to the same chip...
        throw::catch,
        kick::miss,
        tackle::fumble
      ) >> receiver,
      sender >> receiver ( # shorthand for above...
        throw::catch,
        ...
      ),
      sender >> receiver ( # even shorter when the endpoints share a name...
        :pass:,
        :hike:,
        :handoff:
      ),
      sender >> receiver ( # and of course they can be nested...
        throw: (
          :catch,
          :miss,
          :fumble
        )
      ),
      sender >> throw: ( # in many ways...
        :catch >> beeQueue,
        :miss >> looseStart,
        :fumble >> arcFronter
      ),
      sender >> ( # who even knows what's possible??
        throw::catch >> looseStart,
        (
          kick::miss,
          :pass:
        ) >> beeQueue,
        tackle: (
          (
            :fumble,
            :handoff:
          ) >> arcFronter,
          :catch >> narrowSender
        )
      ),
      ...
    ],
  },
  anotherUserDefinedCircuit: { ... },
  ...
  [
    # implicit core wires, (?)
    wires >> between::builtIn >> circuits,
    and >> or::userDefined >> circuits,
    ...
  ]
},
[
  # implicit global wires, (?)
  ...
]
# }
```

## Use

```text
# do I really need separate sections for chips and wires, or can they be differentiated syntactically?
#> maybe the chips/imports could just be a big multiplexer? so a circuit would be:
{ ( literalOrAncRefOrSomething
      => localName,
    ...
) 
some >> wires: >> iGuess, ... }
###

# assignment/aliasing/labeling (only chips can have labels, not wires)
Blueprint = { ... };
|label| { ... };
BlueprintThat = |isLabeled| { ... };
archive: [ Blueprints, andNested: [ Archives, ... ], ... ] # mmmmaybe?

{::}, # identity (anonymous)
{:endpoint:}, # identity with named endpoint(s) (why?)
||, # also identity
|name|, # named identity chip (aka 'label', 'variable', 'alias', etc)

|name| ofCircuit, # chip
circuitRef :name >> ofInpoint, # wire
literal singleton, # wire
literal singleton anotherSingleton, # wire chain
(plex, er) indexedCircuit # 'indexed' circuits have a variable number of endpoints that are numbered, not named (plexers themselves are indexed circuits)
# technically it's the chip's endpoints that are indexed, not the chip itself, so there are three kinds: indexed-in, indexed-out, and bi-indexed
# oh and indexed circuits can also have named endpoints, they're not mutually exclusive

[
  'Hello, world!' log+>Core.console,
  Core.console->string &name,
  ['Hello, ', &name, '!'] log+>Core.console,
  [5, 3] add &sum,
  &sum log+>Core.console,
  [&sum, 2] pow log+>Core.console,
  ['hel', 'f'] munge [&h, &elf]
]

this (a:, b:) + (::, 2) ** ('The squared sum is ', ::, ', dawg.') :words this;
this isButtered:: not (::condition, n@@) incWhile (@@result, result::, this butterAmount::) * (|quantity|, ::howMuchButter this);
bread isToasted:: choose (
  isTrue::startButtering bread, quantity@ :butter bread, bread@ :toast this,
  isFalse::startToasting toaster, :bread@: toaster
);


#>
|fib| {
  |rec| {
    [
      [in->n, 1] sub n+>fib,
      [in->n, 2] sub n+>fib
    ] add out # rec.out
  }
  [in->n, 1] lte switch+>choose
  ^choose (
    1 ifTrue+>,
    rec ifFalse+>,
    ->choice out # fib.out
  )
}
Core.input->number fib log+>Core.output
>#

#> in/out (nee "this") alternatives
el ar
arr ext
arr lve # !
arrv leav
arr rra
come go
from to
src dst # *
+> -> # **** no need for special syntax!
# check: can ownInpoint+> be ambiguous with +>defaultInpoint or transistorEndpoint+> ?
# possible solution: +>* *-> (* === 'this')
/parent
/super
/outer
/self # !
>#

src->out in+>mid->out in+>dst # optional ; to terminate statement
src->out & in+>dst # the identity chip doubles as an explicit wire! (might not be necessary anymore)
src->sharedEndpoint+>dst
src->['out'] ['in']+>dst
src->["this endpoint's shared"]+>dst
src->out &labeledEndpoint+>dst # creates a label with the same name as the endpoint. If one already exists, this is an error...
src->out [&strIn]+>dst # NOT to be confused with this...
src->[&strOut] in+>dst # which will use the string *in* &endpoint (similar to obj[variable] in js)
src->&sharedLabel+>dst
src->[&sharedLookup]+>dst

#>
src:>out in->chp:>out in->dst
src->out in:>chp->out in:>dst

src->out => in:>mid->out => in:>dst
src->out := in:>mid->out := in:>dst
src->out, in:>mid->out, in:>dst

@src in:>dst
src->out, :>dst
src dst # src->, :>dst
src->endpoint:>dst
,in:> chp ->out,

src:out in:dst
src:out >> in:dst, # disambiguated
src:out in:dst, # equivalent^
src:out -> in:dst; # alternative
chp@ in:dst, # chip as signal 
chp@ :dst, # anonymous inpoint
src:out :dst, # non-meta version
src: in:dst, # anonymous outpoint
src dst, # both (also `src::dst`, `src: >> :dst`)
src:>endpoint:>dst; # shared name
in-> :chp: ->out; # recursive circuit

this: (a, b) + (>>, 2) ** ('The squared sum is ', >>, ', dawg.') words:this,
this:isButtered not (>> condition, n->) incWhile (->n, result >>, this:butterAmount) * (|quantity|, howMuchButter:this);
this:loaf bread:slicer:breadSlice |bread|; # TODO: disambiguate anonymous endpoints and in-chip-out shorthand
bread:isToasted (>>switch, (
  true butter:bread, @quantity butterAmount:bread, bread@
) >>ifTrue, (
  startToasting:toaster, bread@ breadSlice:toaster, null
) >>ifFalse) :choose: butteredToast:this;
```

## Implementation

```javascript
{
Choose: {
  if: <() { return op("choose") }>,
  [
    => if (
      condition::0,
      ifTrue::1,
      ifFalse::2,
    ),
    if =>::result =>
  ]
}
}
```
