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

Compiles to/from intermediate representation that preserves the structure,
but loosens the syntax requirements for readability and convenience

TODO: position, designating circuits (or circuit refs) as templates, distinguishing circuit names from template names (initial capital?), resolving ambiguity when referencing ancestor (or whatever) circuits, defining non-source-order priority for defaults

```text
program -> '{' circuitList '}'
circuitList -> namedCircuit [ ',' namedCircuit ]
namedCircuit -> circuitName ':' circuitRef

circuitRef -> circuitName | circuitLiteral
circuitName -> variable

variable -> '"' varChars '"'
varChars -> alpha [ alphaNumeric ]
alpha -> /[a-zA-Z_.]/ # ':' too?
alphaNumeric -> ( alpha | /[0-9]/ ) [ alphaNumeric ]

circuitLiteral -> '{' [ subcircuits ',' connections ] '}'
subcircuits -> '"chips": {' [ circuitList ] '}'
connections -> '"wires": {' [ pairList ] '}'

varList -> variable [ ',' variable ]
pairList -> variable ':' variable [ ',' pairList ]
```

Example program using 'loosened' syntax:

```javascript
{
// outermost "global" circuit is mostly implicit
// core: {
//   chips: {
//     built-in circuits,
circuitAddress: {
  chips: { // components?
    fullSyntax: {
      ref: templateOrAddressOrLiteral,
      pos: [x, y, z], // all default to 0, but must be in this order
      otherFields: ?,
    },
    shorthandSyntax: [ref, x, y, z, ...],
    nameEqualsRefShorthand: [x, y, z, ...],
    allDefaultsShorthand: ref,
    combinedShorthand,
    // ---------------------------------------------------------- //
    innerAddress: templateName, // creates a copy (a la class/prototype)
    circuitName, // references an ancestor (any?) circuit directly (sort of like an import; implies possible recursion)
    // wait, should this even exist? the 'state' of ancestor circuits should be unmodifiable, since they've already run (and if you need that state, you should simply pass it to the child circuit as input), and if you do change the state, it's now a copy and not a 'direct' reference
    // maybe this is just a shorthand for passing state from ancestor to child, without having to create a bunch of intermediary endpoints?
    // I suppose state could also go from child to parent, but what advantage would that have over a template?
    // perhaps there could also be a shorthand that means "whatever input such-and-such circuit got the last time it ran, give so-and-so circuit that same input as defaults"?
    // ---------------------------------------------------------- //
    circuitLiteral: {
      chips: { ... },
      wires: { ... },
    },
    ...
  },
  wires: {
    source.outputName: destination.inputName, // all wires follow this general form

    // comparing dotted syntax to alternatives:
    src.out: dst.in,   // % easy to type, intuitive to experienced programmers, but the shorthands are difficult to read at a glance; might be better for disambiguating ancrefs
    src::out: dst::in, // X ugly; shorthand syntax leads to even worse ugliness (`src::: ::in`, `::out: ::in`, `crt::::`, etc.)
    src>out: dst>in,   // X ambiguity with comparison
    src->out: dst->in, // % tricky to type
    src..out: dst..in, // % somewhat better than just one, but still ugly
    src>>out: dst>>in, // ! very easy to type, ambiguous with bit shift operator (but that will be moot if there are none), recursive shorthand looks a bit ugly (crt>>>>in, crt>>out>>, crt>>>>)
    src:>out: dst:>in, // * somewhat less easy to type, but looks 20% cooler, esp. for recursive shorthand (crt:>:>in, crt:>out:>, crt:>:>) (src:>:>: :>in)
    src>:out: dst>:in, // % not sure why I think circuit:>endpoint is better than circuit>:endpoint, but I do (maybe 'cause it looks more like an arrow?)
    src=>out: dst=>in, // * speaking of which, also not sure why I'm resisting the obvious. Just to be different? Tricky to type, but not for *me*, and it clearly hasn't hurt other languages.
    // src=>: =>in, =>out: =>in, crt=>=>, crt=>in=>, crt=>=>out
    src.>out: dst.>in, // ! about as easy as :>, looks very weird to someone used to traditional operators, possible ambiguity with comparison
    src>:out: dst:>in, // X confusing as heck
    src:>out: dst>:in, // X (see?)

    all.wires: useInternal.addresses, // circuits are only in control of wires inside themselves, not to other circuits
    42: giveMeLiterals.number, // "primitive" literals are circuits (all singletons, at least in theory) that output themselves and have no inupts...
    { chips: { ... }, wires: { ... } }: giveMeLiterals.anonymousCircuit // although non-primitives can also output themselves!
    "Here is a string literal.": giveMeLiterals.string,
    true: giveMeLiterals.isBoolean,
    null: giveMeLiterals.nuthinHere, // null (also written '{}') is a primitive representing the empty circuit: it has no endpoints, so its only output is itself
    // (null is the default for all unused endpoints, so its only use in wires is for explicitly overriding another source/destination)
    giveMeLiterals.ignored: {}, // normally, using a circuit with no in-points as a destination is an error, but null is an exception (it ignores all input)
    in.endpointName: out.endpointName, // the special addresses 'in' and 'out' define (and reference) the circuit's own endpoints
    .ownInpointName: .ownOutpointName, // they can be omitted...
    singleOutputCircuit.: singleInputCircuit., // and so can the endpoints of circuits with only one input/output...
    wholeEntireCircuit: [out.?]maybeCircuitMaybeEndpoint[.name?], // but the separator is not optional (as a source, it takes the entire circuit as input; as a destination, it may be ambiguous)
    this: someHigherOrderCircuit.fancyIGuess // the special address 'this' can be used to pass the circuit itself to an endpoint...
    out.invalidSource: in.invalidDestination, // but circuits cannot recurse on themselves explicitly (that would be defining wires outside the circuit)
    thisIsFine.output: thisIsFine.input, // recursion of a child circuit is allowed, of course...
    recursiveCircuit.output.input, // and even has its own shorthand syntax...
    simpleRecursiveCircuit..input, // which can be even shorter if the circuit only has one output...
    otherSimpleRecursion.output., // or input...
    simplestRecursiveCircuit.., // or both
    ...
  },
},
anotherUserDefinedCircuit: { ... },
...
//   },
//   wires:
{
  // built-in wires (?)
  wires.between: builtIn.circuits,
  and.or: userDefined.circuits,
  ...
}
//   }
}
```
