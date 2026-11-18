const general = require('./general')
const op = require('./operators')

const moduleNames = [
  "diceStats",
  "drawing",
  "sequences",
  // "meta",
  "numbers",
  "objects",
  "random",
  "reducers",
]

const moduleEntries = moduleNames.map(name => [ name, require(`./${name}`) ])

;`
const modules = Object.fromEntries(moduleEntries)
const {
  sequences: {
    isIterable,
    range,
    repeat,
  },
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
  // more?
} = modules
const common = {
  anyDefault,
  getSorter,
  isNum,
  isInt,
  isIterable,
  isTruthy,
  print,
  range,
  repeat,
}
;`

module.exports = {
  ...general,
  // ...common, (export most-useful functions here, explicitly, to help avoid circular dep.s)
  op,
  // ...modules,
  ...Object.fromEntries(moduleEntries),
}

/*
var utils = require('./utils')
.common
*/
