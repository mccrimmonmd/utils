const random = require('./random')
const draw = require('./draw')
const objects = require('./objects')
const general = require('./general')

module.exports = {
  ...general,
  random,
  draw,
  objects,
} // = require('./utils')
