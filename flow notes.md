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
program -> '{' [ circuitList ] '}'
circuitList -> variable ':' circuit [ ',' circuitList ]

circuit -> circuitRef | circuitLiteral
circuitRef -> '"' circuitId '"'
circuitId -> '*' [ path ]
path -> '.' varChars [ path ]

variable -> '"' varChars '"'
varChars -> alpha [ alphaNumeric ]
alpha -> /[a-zA-Z_]/
numeric -> /[0-9]/
alphaNumeric -> ( alpha | numeric ) [ alphaNumeric ]

circuitLiteral -> '{' pairList '}' | primitive
pairList -> inpoint ':' source [ ',' pairList ]
inpoint -> '"' varChars ' +> ' circuitId '"'
source -> primitive | circuitRef | outpoint
outpoint -> '"' circuitId ' -> ' varChars '"'

primitive -> flowPrimitive | jsonPrimitive
jsonPrimitive -> JSON number, boolean, or string
flowPrimitive -> '[' type ',' value ']' | null | identity | operator

type -> '"' ( 'regex' | 'html' | 'js' | 'css' | 'file' ) '"'
value -> JSON string
null -> 'null'
identity -> '{}'

operator -> '[' opname [ parameters ] ']'
opname -> op list from utils, more or less
parameters -> circuitRef [ ',' parameters ]

```

## Syntax

Comment character is `#`, multiline comments with `#>...>#` (`//` is an empty regex literal)

```text
...->... ...+>... = wire aka statement; connection between two chips
( <sequence of wires separated by ; or newline> ) = transistor; a partial circuit (has implicit endpoints that default to identity--see & below)
<sequence of statements and transistors> = blueprint aka circuit
{ <blueprint> } = blueprint 'instantiated' as anonymous chip literal
&name: ( <blueprint> ) = named transistor
&name: { <blueprint> } = named chip literal
{} = empty blueprint as chip literal aka null
* = local endpoints (aka 'this' aka current context/namespace) as chip literal
** = current endpoints' endpoints as chip (=== itself)
****** = same (you get the idea)
{ * } = null's endpoints as chip literal aka empty chip aka also null
{ <blueprint> }* chip literal as signal aka <blueprint>'s '*'
{}* = null as signal aka null's '*' aka also null
{*}* = same (you get the idea)
& = add 'identity' wire to current blueprint aka 'smallest nonempty blueprint' as chip literal (OR: & = empty *transistor*, so `&*` would be * and `&: ()` or `()` would be &)
( _+>*->_ ) = same
Each identity chip is globally unique, like Symbols--that's why they aren't inherited and don't have their own namespaces
&* = identity's 'this' aka identity as signal (=== *, not &)
&** = also * (makes sense, if identity's 'this' and this's 'this' are both also 'this')
&variable = add new endpoint to identity's blueprint (i.e. variable+>&*->variable)
&someChip* = &someChip's blueprint as chip `{ someChip's blueprint }`
someChip* = someChip as signal aka someChip's blueprint's 'this' `{ someChip's blueprint }*`

inpoint+>* = add new endpoint to * 
*->outpoint = same
.dottedRef = &Program.dottedRef in toplevel files, but the circuit's parent archive otherwise  ('Program' === toplevel namespace)
dotted.ref = *.dotted.ref; any in-scope chip can be treated like an archive 
```

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
- possibly...rethink literally everything??
  - think in terms of wires, not chips--aside from the primitive operators, chips are just lists of wires anyway. Specify the *connection* over the source and destination. So, instead of `src->out, in:>dst`, something like `src >> dst (out:>in, and:>another, youGet:>theIdea)` ?

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

{
  AllArchives = [ ... ]
  AreVisible = [ ... ]
  ToChildrenBut = [ ... ]
  NotParents = `...`
  
  # Core is always imported implicitly
  
  AutomaticArchives= # archives that are always "available" but have to imported to be "visible"
  HeresAnother= # e.g. Math, IO, DateTime
  ThisArchive = IsAliased # the right side doesn't have to be imported first if it's one of these
  
  nowCome: { ... }
  theBlueprints: `...`
  
  and->theTop level+>circuit
  composed ofMany+>statements &akaWires
  # the top(est)level *does not have* 'src' and 'dst' (alternatively, '*' refers to null)! Only IO and system chips can reach outside it.
  # a .flw file with {} at the toplevel is a circuit
  # a .flw file with [] at the toplevel is an archive
  # as shown, they can nest inside each other arbitrarily
  # or: archives are circuits, somehow? would be better if they were. Then, toplevel circuits with no (explicit) enclosing braces--meaning circuits whose self-reference is null--would be executable programs
  # ^archives are just conventions--blueprints that start with a capital letter and have some syntactic sugar. Otherwise no different from a regular blueprint. 
  # what's the desugared version, then? What does the dot syntax translate to?
  # ... maybe it's the other way around? maybe UN-dotted syntax is the sugared version, and bare references are implicitly dotted.
  # or, dots translate to 'nested dereferences' of circuits that output their own namespaces?
}
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
>#

Archive = [
  list: { ... }
  of: { ... }
  blueprints: { ... }
  And = NestedArchives
]; # Archive.And === NestedArchives
ArchiveFrom = `file.flw`
blueprint: { ... };
{ ... }* &deSugaredBlueprint*;

&, # the identity chip, a singleton (within scope) primitive
&name, # identity chip with named endpoint, aka 'label', 'variable', 'alias', etc.

blueprint: { ... } # blueprint aka (named) circuit aka (named) chip definition
{ ... } &label # labeled chip (actually it's the chip's outpoint that gets the label, i.e. the wire goes to the identity circuit and that's how you refer to it again)
( ... ) # transistor aka mini-chip (implicit endpoints, does not create its own scope, empty transistor === &)
&label (
  ...
) # transistors can be prefaced with a destination label that would otherwise have to be placed at the end
chip (
  42 theAnswer+>
  ->theQuestion askAgain+>deepMind
) # transistors can also be prefaced with a source chip; references within the transistor to the source's endpoints don't have to specify the source (i.e. ->out and in+> instead of chip->out and in+>chip)
chip &label (
  ... 
) # combining the two
src dst (
  ->fromSrc gimme+>someOtherChip
  someOtherChip->here toDst+>
  dst->here gimme+>src
) # if the destination is a chip instead of a label, the source can be left off the outpoints and the destination can be left off the inpoints (but not vice versa)

[plex, er] indexedCircuit # 'indexed' circuits have a variable number of endpoints that are numbered, not named (plexers themselves are indexed circuits)
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

fib: {
  &rec ([
    [+>*, 1] sub fib,
    [+>*, 2] sub fib
  ] add)
  [[+>*, 1] is,  1] @if
  [[+>*, 0] lte, 0] @if^
  &rec else+>if^
  ^if *->
}
print: { +>* log+>Core.console }
Core.console->number fib print

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
src->['out'] ['in']+>dst # desugared (useful for endpoint names that have reserved characters/keywords/spaces)
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
>#

src* in+>dst # chip literal as signal
src->out &label* # turn signal back into chip (label* and &label are now both === identity/chip as signal still, label === back to chip literal)
src->out +@dst # "push" to next empty index in dst
src-@ in+>dst # "peek" from next nonempty index in src
src->out +=dst # "spread" a plexer from src into dst
src-= in+>dst # "condense" an indexed circuit into a plexer
src-= +=dst # map each index from src to the same index in dst
src @ dst # same
src-@2 4+@dst # indexed input/output
src->[2] [4]+>dst # explicit
src->out dst # anonymous/default inpoint
src->out _+>dst # explicit
src dst # both; src->_+>dst, also src @ dst when unambiguous
& ->out chp in+> & # is a dedicated recursive shorthand really necessary anymore? Maybe just use a transistor? 
rec: (>>) # compromise? non-shorthand: rec: (:->_+>:) / |rec| (|->_+>|)
rec (-> nonBaseCase+>) # recursive, anonymous outpoint
rec (>> nonBaseCase); rec (result >>) # shorthand
increment (
  ->result number+> # shorthand: result >> number
  untilFalse+> # inpoints automatically block on false, which is also null
  ->result someOther+>chip
)
[{}, false] is log+>Core.console # prints "true"
[&, true] is log+>Core.console # prints "true"
is (null, {}) # more natural to read
{ ... } (
  [is (*, true), is (*, false)] or log+>Core.console # prints "false"
  is (
    [*, 4, 'a string'] asBooleans @ *, true @*
  ) log+>Core.console # prints "true"
  is (
    [&labeledFalsity, 0, '', //] asBooleans @ *,
    false @*
  ) log+>Core.console # prints "true"
)

# 'X asYs' and 'X asY' evaluate to `X +>convert; Y targetType+>convert^; _s plexed+>convert^;`
# 'is' and 'are' also, refer to the same blueprint; 'eq' is not as strict

#>
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
>#

squaredSum: {
  [+=* add, 2] pow *->&result
  [
    "The squared sum of ",
    (+=* asStrings concat; ", " separator+>concat^),
    " is ",
    &result,
    "."
  ] concat *->words
}
"Enter a list of numbers separated by spaces. Press Enter when finished." log+>Core.console
split:_ (
  Core.console->string+>split
  " " by+>split
  split
) asNumbers squaredSum
# Core.console->string+>split
# " " by+>split^
# ^split asNumbers squaredSum
^squaredSum->words log+>Core.console
"Are we there yet?" log+>Core.console
[^squaredSum->result, 100] gt cond+>switch
^switch (
  "Yes." ifTrue+>
  "We'll get there when we get there!" ifFalse+>
  ->choice log+>Core.console
)

makinToast: {
  isButtered+>* cond+>switch
  [&quantity, *->howMuchButter]: (
    [butterAmount+>*, hunger+>*] mult
  ) *->howMuchButter
  ^switch (
    &quantity ifFalse+>
  
  loaf+>* +>Bread.slicer-> &slice*
  slice->isToasted startButtering+>slice
  &butterAmount+>slice
  slice->isToasted not startToasting+>Bread.toaster
  slice*+>Bread.toaster^
  slice* & *->butteredToast
  # slice* *->butteredToast
  # slice**->butteredToast ?
}
# alias: someChip === someChip* &alias*
# &alias: someChip === someChip &alias
# alias:_ === alias* &alias*
# &alias:_ === alias &alias
# end->point: (blah) === blah end->point (?)
# end+>point: (blah) === blah end+>point
# something: (transistor) === (transistor)->_ something
[someChipAs: asVar, anotherAsItself:] (
  asVar->spam ham+>anotherAsItself
  ["eggs", "beans", "bacon"] sides+>asVar
  someOutsideChip server+>asVar
)
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
