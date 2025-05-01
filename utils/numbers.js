const myself = {} // documentation
const { print, op, arrayOf, range } = require('./general')
const { sum, product, diffsCalculator } = require('./reducers')

myself.sieve = "Sieve of Eratosthenes. Just for funsies. Might refactor into a bignum generator later."
const sieve = (n) => {
  if (n < 0) n = -n
  const isPrime = arrayOf(n + 1, true)
  isPrime[0] = false
  isPrime[1] = false
  let candidate = 2
  while (candidate ** 2 <= n) {
    while (!isPrime[candidate]) candidate += 1
    for (const i of range(candidate * 2, n + 1, candidate)) {
      isPrime[i] = false
    }
    candidate += 1
  }
  return isPrime
}

myself.isPrime = "Also just for funsies. Will replace with fancier test (e.g. Miller-Rabin) later."
const isPrime = (n) => sieve(n + 1)[n]

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
  rawUnits = rawUnits.toLowerCase()
  const units = rawUnits + rawUnits.endsWith('s') ? '' : 's'
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
      throw new TypeError(`Time unit '${units}' invalid or unimplemented`)
  }

  return op(fromMs ? 'div' : 'mult')(time, ...factors)
}

module.exports = {
  docs: () => print(myself),
  sieve,
  isPrime,
  roundDecimal,
  arithmeticMean,
  diffsCalculator,
  stdDeviation,
  msConverter,
}
