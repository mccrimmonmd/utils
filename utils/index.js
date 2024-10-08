const numbers = require('./numbers')
const random = require('./random')
const drawing = require('./drawing')
const objects = require('./objects')
const general = require('./general')

general.docs.numbers = "Functions for working with numbers, especially lists of numbers."
general.docs.random = "Functions for generating and using random numbers."
general.docs.drawing = "Functions for drawing and animating ASCII art."
general.docs.objects = "Functions for working with objects, especially JSON."

module.exports = {
  ...general,
  numbers,
  random,
  drawing,
  objects,
}

/*
var {
  numbers,
  random,
  drawing,
  objects,
  ...general
} = require('./utils')
*/

