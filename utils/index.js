const random = require('./random')
const draw = require('./draw')
const general = require('./general')

module.exports = {
  ...general,
  random,
  draw,
} // = require('./utils')
