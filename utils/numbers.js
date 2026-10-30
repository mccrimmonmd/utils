const myself = {
  aboutMe: "Functions for working with numbers and sequences of numbers."
}
const { print, len, arrayify, range } = require('./general')
const { sum, product, diffsCalculator } = require('./reducers')
const op = require('./operators')

myself.Complex = "Complex numbers. Why not??"
// TODO: make immutable
const Complex = class {
  constructor(...params) {
    if (params.length === 1) {
      const param = params[0]
      if (param != null && typeof param === 'object') {
        params = [ param.r, param.i ]
      }
    }
    const [ r, i ] = params
    this.r = Number(r ?? 0)
    this.i = Number(i ?? 0)
  }

  #checkType(other) {
    if (other instanceof Complex) return other
    else return new Complex(other)
  }

  plus(other) {
    other = this.#checkType(other)
    return new Complex(this.r + other.r, this.i + other.i)
  }

  minus(other) {
    other = this.#checkType(other)
    return new Complex(this.r - other.r, this.i - other.i)
  }

  mult(other) {
    other = this.#checkType(other)
    const [ r, i ] = [
      (this.r * other.r) - (this.i * other.i),
      (this.r * other.i) + (this.i * other.r),
    ]
    return new Complex(r, i)
  }
}

myself.sieve = "Sieve of Eratosthenes. Just for funsies."
// TODO: add (partially-)precalculated Array/Set parameter
const sieve = (n, /* precalc = [false, false, true] <-like-a-dis */) => {
  n = Math.abs(n)
  const numbers = Array(n + 1).fill(true)
  numbers[0] = false
  numbers[1] = false
  let candidate = 2
  while (candidate ** 2 <= n) {
    while (!numbers[candidate]) candidate += 1
    for (const i of range(candidate ** 2, n + 1, candidate)) {
      numbers[i] = false
    }
    candidate += 1
  }
  return numbers.reduce((primes, isPrime, i) => {
    if (isPrime) primes.add(i)
    return primes
  }, new Set())
}

myself.isPrime = "Also just for funsies. Will replace with fancier test (e.g. Miller-Rabin) later."
const isPrime = (n) => sieve(n).has(n)

myself.isNum = "Checks the type of the given value against both 'number' and 'bigint'"
const isNum = (thing) => ['number', 'bigint'].includes(typeof thing)

myself.isInt = "Checks if the given value is an integer (BigInt OR Number)."
const isInt = (thing) => typeof thing === 'bigint' || Number.isInteger(thing)

myself.absolute = "Math.abs, but also works with BigInts."
const absolute = (num) => num < 0 ? -num : num

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

myself.timeConverter = "Converts between different units of time. By default, it converts from ms to the smallest unit that gives a result < 100, or the largest supported unit if none do."
const timeConverter = (
  time,
  fromUnits = 'ms',
  {
    toUnits,
    verbose = false,
  } = {}
) => {
  const allUnits = {
    ms: 1,
    seconds: 1_000,
    minutes: 60,
    hours: 60,
    days: 24,
    years: 365.25,
  }
  const unitNames = Object.keys(allUnits)
  fromUnits = codifyUnits(fromUnits)
  toUnits = codifyUnits(toUnits)

  const log = (result, to = toUnits, v = verbose) => {
    if (v) {
      console.log(`timeConverter: ${time} ${fromUnits} -> ${result} ${to}`)
    }
    return result
  }

  const codifyUnits = (rawUnits) => {
    if (rawUnits == null) return rawUnits
    let units = rawUnits.toLowerCase()
    if (!units.endsWith('s')) units += 's'
    if (units === 'milliseconds') units = 'ms'
    if (allUnits[units] == null) {
      throw new TypeError(`Time unit '${rawUnits}' invalid or unimplemented`)
    }
    return units
  }

  if (toUnits == null) {
    for (const unit of unitNames) {
      const result = timeConverter(time, fromUnits, { toUnits: unit, verbose: false })
      if (result < 100 || unit === unitNames.at(-1)) {
        return log(result, unit, true)
      }
    }
  }

  const fIndex = unitNames.indexOf(fromUnits)
  const tIndex = unitNames.indexOf(toUnits)
  const unitDiff = fIndex - tIndex
  if (unitDiff === 0) return log(time)
  const factors = []
  let [ lesser, greater ] =
    unitDiff < 0 ? [ fIndex, tIndex ] : [ tIndex, fIndex ]
  while (lesser < greater) {
    factors.push(allUnits[unitNames[greater]])
    greater -= 1
  }
  const factored = op(unitDiff < 0 ? 'div' : 'mult')(time, ...factors)
  return log(factored)
}

myself.niceNumber = "Makes numbers a bit nicer to read by appending their short-form names (but reduces precision)."
const niceNumber = (num) => {
  const postfixes =
    [
      '', 'k', 'M', 'B', 'T',
      ' Quad.', ' Quint.', ' Sext.', ' Sept.', ' Oct.', ' Non.', ' Dec.'
    ]
  let factor = 0
  while (num >= 1000 && factor < postfixes.length - 1) {
    factor += 1
    num /= 1000
  }
  return '' + roundDecimal(num) + postfixes[factor]
}

myself.fromBase = "Computes the decimal equivalent of some other number, given as a radix (base) and two arrays of nonnegative integers representing the digits of the characteristic and mantissa (a.k.a. the digits before and after the decimal point). For example, 0xFF80 would be `fromBase(16, [15, 15, 8, 0])` (which correctly returns 65408). Supports negative and even fractional bases--for example, `fromBase(-10, [1, 9, 3], [5])` reveals that twelve and a half in base minus-ten is 193.5, while the same in base Pi is approximately 102.13002112001101..."
// TODO: support complex radixes, somehow?
// TODO: implement inverse function that translates a decimal number into
// an arbitrary-base representation (to some finite precision)
const fromBase = (radix, intDigits = [], mantissa = []) => {
  let result = 0
  // use BigInts if possible
  if (mantissa.length === 0 && isInt(radix)) {
    result = 0n
    radix = BigInt(radix)
    intDigits = intDigits.map(digit => BigInt(digit))
  }
  const absBase = Math.abs(radix)
  for (const [i, digit] of intDigits.reverse().entries()) {
    if (typeof radix === 'bigint') i = BigInt(i)
    if (digit >= absBase) console.warn(`${digit} is supposed to be less than ${absBase}, dummy`)
    result += digit * (radix ** i)
  }
  for (const [i, digit] of [0].concat(mantissa).entries()) {
    if (typeof radix === 'bigint') i = BigInt(i)
    if (digit >= absBase) console.warn(`${digit} is supposed to be less than ${absBase}, dummy`)
    result += digit * (radix ** -i)
  }
  return result
}

// TODO: test, export
myself.epochToDuration = "Recently encountered an API that mistakenly interpreted durations (number of milliseconds) as timestamps. This function is a wrapper for Date.parse, translating those mistaken dates back into ms."
const epochToDuration = (dateString) =>
  Date.parse(dateString.replace(' ', 'T'))

module.exports = {
  aboutMe: () => myself.aboutMe,
  allAboutMe: () => myself,
  sieve,
  isPrime,
  isNum,
  isInt,
  absolute,
  roundDecimal,
  arithmeticMean,
  diffsCalculator,
  stdDeviation,
  timeConverter,
  niceNumber,
  fromBase,
}
