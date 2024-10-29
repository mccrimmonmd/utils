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

myself.diffsCalculator = "Helper function for stdDeviation, but can also be used by itself. Returns a function for use as an argument to Array.prototype.reduce"
const diffsCalculator = (mean) => 
  (diffs, value) => diffs.concat((value - mean) ** 2)

myself.stdDeviation = "Calculates the standard deviation of a list of numbers. Assumes the list is a population, not sample."
const stdDeviation = (values) => {
  const mean = arithmeticMean(values)
  const diffs = values.reduce(diffsCalculator(mean), [])
  const variance = arithmeticMean(diffs)
  return Math.sqrt(variance)
}

myself.sum = "Adds two numbers. For use as an argument to Array.prototype.reduce"
const sum = (total, value) => total + value

myself.product = "Multiplies two numbers. For use as an argument to Array.prototype.reduce"
const product = (total, value) => total * value

myself.average = "Calculates the arithmetic mean of two numbers. For use as an argument to Array.prototype.reduce, but may be less accurate than arithmeticMean due to rounding errors."
const average = (total, value) => (total + value) / 2

`Helper function for 'stats' that allows it to be used like:

  var collectedStats
  for (const array of arrays) {
    collectedStats = array.reduce(stats, collectedStats)
  }

as well as:

  var collectedStats = array.reduce(stats)
`
const statsInit = (value) => {
  return {
    min: value,
    max: value,
    total: value,
    count: 1,
  }
}
myself.stats = "Calculates min, max, total, and count. For use as an argument to Array.prototype.reduce. Can be used with a loop to combine statistics for multiple different arrays."
const stats = (totalStats, value) => {
  // initial value when collecting stats from multiple arrays
  if (totalStats == null) {
    return statsInit(value)
  }
  // initial value when one is not passed explicitly
  if (typeof totalStats === 'number') {
    totalStats = statsInit(totalStats)
  }
  let { min, max, total, count } = totalStats
  return {
    min: Math.min(value, min),
    max: Math.max(value, max),
    total: total + value,
    count: count + 1,
  }
}

module.exports = {
  docs: () => print(myself),
  roundDecimal,
  arithmeticMean,
  diffsCalculator,
  stdDeviation,
  sum,
  product,
  average,
  stats,
}
