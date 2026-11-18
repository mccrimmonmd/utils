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

;`
const modules = Object.fromEntries(moduleEntries)
const {
  sequences: {
    range,
    ...and so forth,
  },
  meta: {
    print,
    ...etc.,
  },
} = modules
modules.common = {
  all,
  that,
  jazz,
}
;`

module.exports = {
  ...general,
  // ...common, (compile common functions here, explicitly, to ensure no circular dep.s)
  op,
  ...Object.fromEntries(moduleEntries),
}

/*
var utils = require('./utils')
.common
*/
