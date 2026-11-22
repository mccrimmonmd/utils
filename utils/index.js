/**
  A collection of ECMAScript functions for many common (and some uncommon) development tasks. See README.md for no helpful information whatsoever.
*/

// TODO: switch to deno (contribute for Rust practice?) or bun
// TODO: publish to repo! (e.g. npm)
// TODO: ***testing*** (write own toolset??)
// TODO: transition to JSDoc (and/or TypeScript)
//       (mutually exclusive with doing my own testing?)

const moduleNames = [
  "diceStats",
  "drawing",
  "sequences",
  "meta",
  "numbers",
  "objects",
  "operators",
  "random",
  "reducers",
]
const moduleEntries = moduleNames.map(
  (name) => [name === 'operators' ? 'op' : name, require(`./${name}`)]
)
const modules = Object.fromEntries(moduleEntries)

const { // re-export extra-useful/common functions
  meta: {
    anyDefault,
    getSorter,
    isTruthy,
    print,
  },
  numbers: {
    isNum,
    isInt,
  },
  sequences: {
    isIterable,
    range,
    repeat,
  },
} = modules

module.exports = {
  anyDefault,
  getSorter,
  isNum,
  isInt,
  isIterable,
  isTruthy,
  print,
  range,
  repeat,
  ...modules,
} // = require('./utils')

