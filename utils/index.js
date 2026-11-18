const general = require('./general')
const op = require('./operators')

const moduleNames = [
  // "common",
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

module.exports = {
  ...general, // ...common, (compile common functions here, explicitly, to ensure no circular dep.s)
  op,
  ...Object.fromEntries(moduleEntries),
}

/*
var utils = require('./utils')
.common
*/
