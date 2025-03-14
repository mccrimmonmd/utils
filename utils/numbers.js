const myself = {} // documentation
const { print } = require('./general')

myself.roundDecimal = "Rounds (towards zero) to a given number of decimal places."
const roundDecimal = (value, places = 2) => {
  if (typeof value !== 'number' || Number.isInteger(value)) return value
  const magnitude = 10 ** places
  return Math.trunc(value * magnitude) / magnitude
}

myself.arithmeticMean = "Calculates the arithmetic mean of a list of numbers. Can also be used to calculate the 'sample mean' (e.g. for finding the variance)."
const arithmeticMean = (values, isSample = false) => {
  if (!values?.length || (values.length === 1 && isSample)) return NaN
  return values.reduce(sum) / (isSample ? values.length - 1 : values.length)
}

myself.diffsCalculator = "Helper function for stdDeviation, but can also be used by itself. Returns a function for use as an argument to Array.prototype.reduce"
const diffsCalculator = (mean) => 
  (diffs, value) => diffs.concat((value - mean) ** 2)

myself.stdDeviation = "Calculates the standard deviation of a list of numbers. Assumes the list is a sample by default, but can also be used on populations."
const stdDeviation = (values, isSample = true) => {
  const mean = arithmeticMean(values, isSample)
  const diffs = values.reduce(diffsCalculator(mean), [])
  const variance = arithmeticMean(diffs)
  return Math.sqrt(variance)
}

myself.msConverter = "Converts milliseconds into other common units, or vice versa."
const msConverter = (ms, unit, toMs = false) => {
  const op = (a, b) => toMs ? a * b : a / b
  switch (unit) {
    case 'days':
      return op(msConverter(ms, 'hours', toMs), 24)
    case 'hours':
      return op(msConverter(ms, 'minutes', toMs), 60)
    case 'minutes':
      return op(msConverter(ms, 'seconds', toMs), 60)
    case 'seconds':
      return op(ms, 1_000)
    default:
      throw new Error(`Time unit '${unit} invalid or unimplemented`)
  }
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
myself.stats = "Calculates min, max, total, and count. For use as an argument to Array.prototype.reduce. Can be used with a loop to combine statistics from multiple different arrays."
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
