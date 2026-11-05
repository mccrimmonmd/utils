const general = require('./general')
const op = require('./operators')

const myself = {
  utils: general.aboutMe(),
  op: op('aboutMe'),
}

const moduleNames = [
  // "common",
  "diceStats",
  "drawing",
  // "sequences",
  // "meta",
  "numbers",
  "objects",
  "random",
  "reducers",
]

const moduleEntries = moduleNames.map(name => [ name, require(`./${name}`) ])
for (const [ name, module ] of moduleEntries) {
  myself[name] = module.aboutMe()
}

module.exports = {
  ...general, // ...common,
  aboutMe: () => myself,
  op,
  ...Object.fromEntries(moduleEntries)
}

/*
var utils = require('./utils')
.common
*/

