const numbers = require('./numbers')
const random = require('./random')
const diceStats = require('./diceStats')
const drawing = require('./drawing')
const objects = require('./objects')
const general = require('./general')

general.docs.numbers = "Functions for working with numbers, especially lists of numbers."
general.docs.random = "Functions for generating and using random numbers."
general.docs.diceStats = "Functions for analyzing dice rolls."
general.docs.drawing = "Functions for drawing and animating ASCII art."
general.docs.objects = "Functions for working with objects, especially JSON."

module.exports = {
  ...general,
  numbers,
  random,
  diceStats,
  drawing,
  objects,
}

/*
var {
  numbers,
  random,
  diceStats,
  drawing,
  objects,
  ...general
} = require('./utils')
*/

