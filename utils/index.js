const numbers = require('./numbers')
const reducers = require('./reducers')
const random = require('./random')
const diceStats = require('./diceStats')
const drawing = require('./drawing')
const objects = require('./objects')
const general = require('./general')
const op = require('./operators')

// const myself = {}
// myself.utils = general.aboutMe()
// ...
// myself.random = random.aboutMe()
// ...

general.docs.numbers = "Functions for working with numbers, especially lists of numbers."
general.docs.reducers = "Functions for passing to Array.prototype.reduce as the callback."
general.docs.random = random.aboutMe()
general.docs.diceStats = "Functions for analyzing dice rolls."
general.docs.drawing = "Functions for drawing and animating ASCII art."
general.docs.objects = "Functions for working with objects, especially JSON."
general.docs.op = "Functional equivalents of JavaScript's native operators."

module.exports = {
  ...general,
  // aboutMe: () => myself,
  op,
  numbers,
  reducers,
  random,
  diceStats,
  drawing,
  objects,
  // iterable,
}

/*
var utils = require('./utils')
*/

