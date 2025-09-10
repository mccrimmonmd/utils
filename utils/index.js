const general = require('./general')
// const op = require('./operators')

// const myself = {
//   utils: general.aboutMe(),
//   op: op('aboutMe'),
// }

// const moduleNames = [
//   diceStats,
//   drawing,
//   // iterable,
//   numbers,
//   objects,
//   random,
//   reducers,
// ]

// const moduleEntries = moduleNames.map(name => [ name, require(`./${name}`) ])
// for (const [ name, module ] of moduleEntries) {
//   myself[name] = module.aboutMe()
// }

// module.exports = {
//   ...general,
//   aboutMe: () => myself,
//   op,
//   ...Object.fromEntries(moduleEntries)
// }

const diceStats = require('./diceStats')
const drawing = require('./drawing')
const numbers = require('./numbers')
const objects = require('./objects')
const op = require('./operators')
const random = require('./random')
const reducers = require('./reducers')

general.docs.diceStats = "Functions for analyzing dice rolls."
general.docs.drawing = "Functions for drawing and animating ASCII art."
general.docs.numbers = "Functions for working with numbers, especially lists of numbers."
general.docs.objects = "Functions for working with objects, especially JSON."
general.docs.op = "Functional equivalents of JavaScript's native operators."
general.docs.random = random.aboutMe()
general.docs.reducers = "Functions for passing to Array.prototype.reduce as the callback."

module.exports = {
  ...general,
  diceStats,
  drawing,
  numbers,
  objects,
  op,
  random,
  reducers,
}

/*
var utils = require('./utils')
*/

