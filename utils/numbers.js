const myself = {
  aboutMe: "Functions for working with numbers, especially lists of numbers."
}
const { print, len, arrayify, range } = require('./general')
const { sum, product, diffsCalculator } = require('./reducers')
const op = require('./operators')

myself.Complex = "Complex numbers. Why not??"
const Complex = class {
  constructor(...params) {
    this.re = 0
    this.im = 0
    if (params.length) {
      if (typeof params[0] === 'object') {
        let { re, im } = params[0]
        this.re = re ?? 0
        this.im = im ?? 0
      }
      else {
        let [ re, im ] = params
        this.re = Number(re)
        this.im = Number(im ?? 0)
      }
    }
  }

  #checkType(other) {
    if (other instanceof Complex) return other
    if (typeof other !== 'object') {
      return new Complex(Number(other), 0)
    }
    return new Complex(other)
  }

  add(other) {
    other = this.#checkType(other)
    return new Complex(this.re + other.re, this.im + other.im)
  }

  sub(other) {
    other = this.#checkType(other)
    return this.add(new Complex(-other.re, -other.im))
  }

  mult(other) {
    other = this.#checkType(other)
    const [ re, im ] = [
      (this.re * other.re) - (this.im * other.im),
      (this.re * other.im) + (this.im * other.re),
    ]
    return new Complex({ re, im })
  }
}

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

myself.timeConverter = "Converts between different units of time (default: converts to ms)."
const timeConverter = (
  time,
  fromUnits,
  {
    toUnits = 'ms',
    verbose = false,
  } = {}
) => {
  const allUnits = [
    'ms',
    'seconds',
    'minutes',
    'hours',
    'days',
    'years'
  ]
  const codifyUnits = (rawUnits) => {
    let units = rawUnits.toLowerCase()
    if (!units.endsWith('s')) units += 's'
    if (units === 'milliseconds') units = 'ms'
    index = allUnits.indexOf(units)
    if (index < 0) throw new TypeError(`Time unit '${rawUnits}' invalid or unimplemented`)
    return index
  }
  const getFactor = (units) => {
    switch (units) {
      case 'years':
        return 365.25
      case 'days':
        return 24
      case 'hours':
        return 60
      case 'minutes':
        return 60
      case 'seconds':
        return 1_000
      default:
        throw new Error(`Time unit '${units}' incorrectly implemented`)
    }
  }
  const result = (time, factors = [1], operator = 'first') => {
    const factored = op(operator)(time, ...factors)
    if (verbose) {
      console.log(`timeConverter: ${time} ${fromUnits} -> ${factored} ${toUnits}`)
    }
    return factored 
  }

  const fUnits = codifyUnits(fromUnits)
  const tUnits = codifyUnits(toUnits)
  const unitDiff = fUnits - tUnits
  const factors = []
  if (unitDiff === 0) return result(time)
  let [ lesser, greater ] =
    unitDiff < 0 ? [ fUnits, tUnits ] : [ tUnits, fUnits ]
  while (greater > lesser) {
    factors.push(getFactor(allUnits[greater]))
    greater -= 1
  }
  return result(time, factors, unitDiff < 0 ? 'div' : 'mult')
}

myself.fromBase = "Computes the decimal equivalent of some other number, given as a radix (base) and two arrays of Numbers representing the digits of the characteristic and mantissa (a.k.a. the digits before and after the decimal point). For example, 0xFF80 would be `fromBase(16, [15, 15, 8, 0])`. Supports negative and even fractional bases--for example, twelve and a half in base minus-ten is `193.5`, while the same in base Pi is approximately `102.13002112001101...`"
// TODO: support complex radixes, somehow
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
    if (digit >= absBase) console.warn(`${digit} is supposed to be less than ${radix}, dummy`)
    result += digit * (radix ** i)
  }
  for (const [i, digit] of [0].concat(mantissa).entries()) {
    if (typeof radix === 'bigint') i = BigInt(i)
    if (digit >= absBase) console.warn(`${digit} is supposed to be less than ${radix}, dummy`)
    result += digit * (radix ** -i)
  }
  return result
}

myself.epochToDuration = "Recently encountered an API that mistakenly interpreted durations (number of milliseconds) as timestamps. This function is a wrapper for Date.parse, translating those mistaken dates back into ms."
const epochToDuration = (dateString) =>
  Date.parse(dateString.replace(' ', 'T'))

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
  timeConverter,
  fromBase,
}
