const myself = {
  aboutMe: "Functions for working with numbers, especially lists of numbers."
}
const { print, len, arrayify, range } = require('./general')
const { sum, product, diffsCalculator } = require('./reducers')
const op = require('./operators')

myself.sieve = "Sieve of Eratosthenes. Just for funsies. Might refactor into a bignum generator...somehow."
const sieve = (n) => {
  n = Math.abs(n)
  const isPrime = Array(n + 1).fill(true)
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
const isPrime = (n) => sieve(n)[n]

myself.isNum = "Checks the type of the given value against both 'number' and 'bigint'"
const isNum = (thing) => ['number', 'bigint'].includes(typeof thing)

myself.isInt = "Checks if the given value is an integer (bigint OR number)."
const isInt = (thing) => typeof thing === 'bigint' || Number.isInteger(thing)

myself.roundDecimal = "Rounds (towards zero) to a given number of decimal places."
const roundDecimal = (value, places = 2) => {
  if (typeof value !== 'number' || Number.isInteger(value)) return value
  const magnitude = 10 ** places
  return Math.trunc(value * magnitude) / magnitude
}

myself.arithmeticMean = "Calculates the arithmetic mean of a list of numbers. Can also be used to calculate the 'sample mean' (e.g. for finding the variance)."
const arithmeticMean = (values, isSample = false) => {
  if (!len(values) || (values.length === 1 && isSample)) return NaN
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
const msConverter = (
  time,
  rawUnits = 'seconds',
  fromMs = true,
  verbose = true,
) => {
  let units = rawUnits.toLowerCase()
  if (!units.endsWith('s')) units += 's'
  const factors = []

  if (units === 'years') {
    factors.push(365.25)
    units = 'days'
  }
  switch (units) {
    case 'weeks':
      factors.push(7)
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

  const result = op(fromMs ? 'div' : 'mult')(time, ...factors)
  if (verbose) {
    const [ fromUnit, toUnit ] = fromMs ? [ 'ms', units ] : [ units, 'ms' ]
    console.log(`msConverter: ${time} ${fromUnit} -> ${result} ${toUnit}`)
  }
  return result 
}

module.exports = {
  // docs: () => print(myself),
  aboutMe: () => myself.aboutMe,
  allAboutMe: () => myself,
  sieve,
  isPrime,
  isNum,
  isInt,
  roundDecimal,
  arithmeticMean,
  diffsCalculator,
  stdDeviation,
  msConverter,
}
