# Flow - A Visual Programming Language

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
- All processing is asynchronous by default ('queue-based' instead of 'stack-based'); multi-input circuits block until all their inputs are ready
- All looping is implicit via recursion--a circuit either redirecting its output to one of its inputs (tail-recursive), or embedding a copy of itself (non-tail-recursive)
  - To support this, recursive inputs will need special handling--something like a 'default' or 'initial' value that supplies input only until/unless it's overridden
    - This doesn't have to be a recursion-specific feature, there are probably lots of other cases where it would be useful

## Circuit Literals

List of 'addresses', with arrows indicating direction (I vs. O)? (Addresses = variable names; some internal, some external.) Initialize addresses at top of circuit; each one references a 'template' that gets copied. (Create your own templates...how?)

## Syntax

Grammar below is for JSON-compliant 'internal' syntax, rarely used directly

Compiles to intermediate representation that preserves the structure,
but loosens the syntax requirements for readability and convenience

TODO: position, designating circuits (or circuit refs) as templates, distinguishing circuit names from template names, resolving ambiguity when referencing ancestor (or whatever) circuits

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

circuitLiteral -> '{' [ inputList ',' outputList ',' subcircuits ',' connections ] '}'
inputList -> '"in": [' [ varList ] ']'
outputList -> '"out": [' [ varList ] ']'
subcircuits -> '"sub": {' [ circuitList ] '}'
connections -> '"link": {' [ pairList ] '}'

varList -> variable [ ',' variable ]
pairList -> variable ':' variable [ ',' pairList ]
```

Example program using 'loosened' syntax:

```javascript
{
// outermost "global" circuit is mostly implicit
// global (or window/top/whatever): {
//   in: [ built-in inputs ],
//   out: [ built-in outputs ],
//   sub: {
//     built-in circuits,
circuitAddress: {
  in: [
    condition,
    ifTrue,
    ifFish,
    ...
  ],
  out: [
    howManyIters,
    finalResult,
    oompaLoompaTally,
    ...
  ],
  sub: {
    innerAddress: templateName, // creates a copy (a la class/prototype)
    circuitName, // references an ancestor (any?) circuit directly (sort of like an import; implies possible recursion)
    // wait, should this even exist? the 'state' of ancestor circuits should be unmodifiable, since they've already run (and if you need that state, you should simply pass it to the child circuit as input), and if you do change the state, it's now a copy and not a 'direct' reference
    // maybe this is just a shorthand for passing state from ancestor to child, without having to create a bunch of intermediary inputs and outputs?
    // I suppose state could also go from child to parent, but what advantage would that have over a template?
    // perhaps there could also be a shorthand that means "whatever input such-and-such circuit got the last time it ran, give so-and-so circuit that same input" (with exceptions specified in the links)?
    circuitLiteral: {
      in: [ ... ],
      ...
    },
    ...
  },
  link: {
    fromCircuit.outputName: toCircuit.inputName, // all links follow this general form
    // alternatives to dotted syntax:
    c::out: c::in, // X ugly, shorthand syntax could lead to even worse ugliness (i.e. `c::: ::in,` and `c::::,`)
    c>out: c>in,   // X ambiguity with comparison
    c->out: c->in, // % tricky to type
    c..out: c..in, // % same as ::, but not as bad
    c>>out: c>>in, // * very easy to type; ambiguous with bit shift operator, but that will be moot if there are none
    c:>out: c:>in, // * somewhat less easy to type, but looks 20% cooler
    c>:out: c>:in, // % not sure why I think circuit:>endpoint is better than circuit>:endpoint, but I do (maybe 'cause it looks more like an arrow?)
    c.>out: c.>in, // ! about as easy as :>, looks very weird to someone used to traditional operators, possible ambiguity with comparison
    c>:out: c:>in, // X confusing as heck
    c:>out: c>:in, // X (see?)
    c.out: c.in, // % easy to type, intuitive to experienced programmers, but the shorthands are difficult to read at a glance; might be better for disambiguating ancrefs
    all.links: useInner.addresses, // circuits are only in control of links inside themselves, not to other circuits
    this.outputName: innerAddress.inputName, // the special circuit address 'this' (or 'self', or whatever) references the circuit's own inputs/outputs
    innerAddress.outputName: .ownInputName, // 'this' can be ommitted...
    singleOutputCircuit.: singleInputCircuit., // and so can the endpoints of circuits with only one input/output...
    illegalSyntax: illegalSyntax, // but the separator is not optional (it could result in ambiguity)
    .thisPair: .isAlsoIllegal, // a circuit cannot recurse on itself...
    thisIsLegal.output: thisIsLegal.input, // except from within a parent circuit...
    recursiveCircuit.output.input, // in which case you can use a shorthand syntax...
    simpleRecursiveCircuit..input, // which gets even shorter if the circuit only has one output...
    otherSimpleRecursion.output., // or input...
    simplestRecursiveCircuit.., // or both
    42: giveMeLiterals.number, // literals are circuits that evaluate to their own addresses/names
    "Here is a string literal.": giveMeLiterals.string,
    true: giveMeLiterals.isBoolean,
    null: giveMeLiterals.null, // the null circuit '{}' ignores all inupt and outputs itself
    ...
  },
},
anotherUserDefinedCircuit: { ... },
...
//   },
//   link:
{
  links.between: global.circuits,
  both.buitIn: and.userDefined,
  ...
}
//   }
}
```
