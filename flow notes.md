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

```json
// implicit "global" outer circuit:
// { "global/window/whatever": {
//   "inputs": [ built-in inputs ],
//   "outputs": [ built-in outputs ],
//   "embedded": {
"Circuit address": { // template name?
  "inputs": [
    "case",
    "ifTrue",
    "ifFish",
    { "inputWithDefault": "otherCircuit[.outputName]" }, // ???
    ...
  ],
  "outputs": [
    "howManyIters",
    "finalResult",
    "oompaLoompas",
    ...
  ],
  "embedded": {
    { 
      "name": "theAddress",
      "ref": "templateOrAddressOrLiteral",
      "pos": [x, y, z] // all default to 0
    },
    { "innerAddress": templateName }, // shorthand
    "otherCircuitAddress", // ultra shorthand
    "innerAddress": templateName, // creates a copy
    "otherInnerAddress": "externalCircuitAddress", // does not create a copy -- possible recursion!
    "yetAnotherInnerAddress": 42, // literal values are 'circuits' (always templates) that output their own addresses
    "circuitLiteral": {
      "inputs": [ ... ],
      ...
    },
    ...
  },
  "connections": {
    "from": "to",
    "allFrom.toPairs": "useInner.addresses",
    "orOwnInput": "andOwnOutputNames", // circuits are only in control of connections inside themselves, not to other circuits
    "innerAddress.outputName": "otherInnerAddress.inputName",
    "innerAddress.outputName": "myOwnOutputName",
    "myOwnInputName": "innerAddress.inputName",
    "yetAnotherInnerAddress": "innerAddress.otherInputName", // parsed JSON will resolve literals, so the left-hand side will just be 42 (and yetAnotherInnerAddress disappears)
    "singleOutputCircuit": "singleInputCircuit", // name is optional if circuit only has one input/output, unless address conflicts with own input/output name
    ...
  },
  ...?
},
"moreGlobalCircuits": { ... },
...
// built-in circuits/templates,
// }, "connections":
{
  "connections.inThe": "global.scope",
  ...
}
// }}
```
