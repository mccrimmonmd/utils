const myself = {} // documentation
const { print } = require('./general')

myself.roundDecimal = "Rounds (towards zero) to a given number of decimal places."
const roundDecimal = (value, places = 2) => {
  if (typeof value !== 'number') return value
  if (Number.isInteger(value)) return value
  let magnitude = 10 ** places
  return Math.trunc(value * magnitude) / magnitude
}

myself.arithmeticMean = "Calculates the arithmetic mean of a list of numbers"
const arithmeticMean = (values) => {
  if (values == null || !values.length) return NaN
  return values.reduce(sum) / values.length
}

myself.sum = "Adds two numbers. For use as an argument to Array.prototype.reduce"
const sum = (total, value) => total + value

myself.product = "Multiplies two numbers. For use as an argument to Array.prototype.reduce"
const product = (total, value) => total * value

myself.average = "Calculates the arithmetic mean of two numbers. For use as an argument to Array.prototype.reduce, but may be less accurate than arithmeticMean due to rounding errors."
const average = (total, value) => (total + value) / 2

myself.stats = "Collects min, max, total, and count in a persistent object. For use as an argument to Array.prototype.reduce"
const stats = (totalStats, value) => {
  if (typeof totalStats === 'number') {
    // convert initial value into stats object
    totalStats = {
      min: totalStats,
      max: totalStats,
      total: totalStats,
      count: 1,
    }
  }
  let { min, max, total, count } = totalStats
  return {
    min: value < min ? value : min,
    max: value > max ? value : max,
    total: total + value,
    count: count + 1,
  }
}

module.exports = {
  docs: () => print(myself),
  roundDecimal,
  arithmeticMean,
  sum,
  product,
  average,
  stats,
}

