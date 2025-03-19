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

Compiles to intermediate representation that preserves the general structure,
but loosens the syntax requirements for readability and convenience

TODO: position, designating circuits (or circuit refs) as templates

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
// outermost "global" circuit is implicit:
// { "global/window/top/whatever": {
//   "in": [ built-in inputs ],
//   "out": [ built-in outputs ],
//   "sub": {
//     built-in circuits,
circuitAddress: {
  in: [
    case,
    ifTrue,
    ifFish,
    ...
  ],
  out: [
    howManyIters,
    finalResult,
    oompaLoompas,
    ...
  ],
  sub: {
    innerAddress: circuitName, // copy if template, otherwise direct reference
    circuitLiteral: {
      in: [ ... ],
      ...
    },
    ...
  },
  link: {
    fromCircuit.outputName: toCircuit.inputName, // all connections follow this general form
    all.connections: useInner.addresses, // circuits are only in control of connections inside themselves, not to other circuits
    this.outputName: innerAddress.inputName, // the special circuit address 'this' (or 'self', or whatever) references the circuit's own inputs/outputs
    innerAddress.outputName: ownInputName, // dotted syntax is optional when referring to own outputs/inupts...
    singleOutputCircuit: singleInputCircuit, // or when referring to a circuit that has only one input/output...
    [this.]illegalSyntax: [innerCircuit.]illegalSyntax, // unless there is a conflict
    this.pair: this.isIllegal, // a circuit cannot recurse on itself...
    innerCircuit.thisPair: innerCircuit.isLegal, // except from within a parent circuit
    42: giveMeLiterals.number, // literals are circuits that evaluate to their own addresses/names
    "Here is a string literal.": giveMeLiterals.string,
    false: giveMeLiterals.boolean,
    null: giveMeLiterals.null, // the null circuit '{}' ignores all inupt and outputs itself
    ...
  },
},
anotherCircuitAddress: { ... },
...
//   },
//   "link":
{
  connections.between: global.circuits,
  ...
}
//   }
// }
```
