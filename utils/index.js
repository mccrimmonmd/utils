const random = require('./random')
const drawing = require('./drawing')
const objects = require('./objects')
const general = require('./general')

module.exports = {
  ...general,
  random,
  drawing,
  objects,
} // = require('./utils')
