const myself = {} // documentation
const { print, op } = require('./general')
const { sum, product, diffsCalculator } = require('./reducers')

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

myself.stdDeviation = "Calculates the standard deviation of a list of numbers. Assumes the list is a sample by default, but can also be used on populations."
const stdDeviation = (values, isSample = true) => {
  const mean = arithmeticMean(values, isSample)
  const diffs = values.reduce(diffsCalculator(mean), [])
  const variance = arithmeticMean(diffs)
  return Math.sqrt(variance)
}

myself.msConverter = "Converts milliseconds into other common units, or vice versa."
const msConverter = (time, rawUnits, fromMs = true) => {
  const units = rawUnits.toLowerCase() + rawUnits.endsWith('s') ? '' : 's'
  const factors = []

  switch (units) {
    case 'days':
      factors.push(24)
    case 'hours':
      factors.push(60)
    case 'minutes':
      factors.push(60)
    case 'seconds':
      factors.push(1_000)
      break
    default:
      throw new TypeError(`Time unit '${rawUnits}' invalid or unimplemented`)
  }

  const divOrMul = fromMs ? '/' : '*'
  const factor = factors.reduce(product, 1)
  return op(time, divOrMul, factor)

  // time = op(time, divOrMul, 1_000)
  // if (units === 'seconds') return time
  // time = op(time, divOrMul, 60)
  // if (units === 'minutes') return time
  // time = op(time, divOrMul, 60)
  // if (units === 'hours') return time
  // time = op(time, divOrMul, 24)
  // if (units === 'days') return time
  
  // throw new TypeError(`Time unit '${rawUnits}' invalid or unimplemented`)
  
  // switch (units) {
  //   case 'seconds':
  //     return op(time, divOrMul, 1_000)
  //   case 'minutes':
  //     return op(msConverter(time, 'seconds', fromMs), divOrMul, 60)
  //   case 'hours':
  //     return op(msConverter(time, 'minutes', fromMs), divOrMul, 60)
  //   case 'days':
  //     return op(msConverter(time, 'hours', fromMs), divOrMul, 24)
  //   default:
  //     throw new TypeError(`Time unit '${rawUnits}' invalid or unimplemented`)
  // }
}


module.exports = {
  docs: () => print(myself),
  roundDecimal,
  arithmeticMean,
  diffsCalculator,
  stdDeviation,
  msConverter,
}
