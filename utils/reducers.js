const myself = {
  aboutMe: "Functions to be provided as the callback to Array.prototype.reduce."
}

myself.flatten = "Concatenates two items that may or may not be Arrays, using push instead of concat for speed. (You should probably just use Array.prototype.flat instead.)"
const flatten = (flattened, bump, i) => {
  if (i === 1) {
    // If the first value was not user-provided, we should either wrap it in
    // an Array if it isn't one, or copy it if it is (to avoid mutating the
    // Array being flattened). The first iteration is taken to be i === 1,
    // not 0, because i only equals 0 when an initial value *is* provided.
    if (Array.isArray(flattened)) flattened = [...flattened]
    else flattened = [flattened]
  }
  if (Array.isArray(bump)) flattened.push(...bump)
  else flattened.push(bump)
  return flattened
}

myself.andReducer = "Takes a function that compares two objects and returns a boolean; returns a callback that tests every adjacent pair in the array and returns true iff every test returns true. Used in operators.js for chaining."
const andReducer = (func) => boolReduce(func, 'and')

myself.orReducer = "Same as andReducer, except the callback returns true iff *any* adjacent pair passes its test."
const orReducer = (func) => boolReduce(func, 'or')

"Private helper function for orReducer/andReducer"
const boolReduce = (func, type) => {
  if (!['or', 'and'].includes(type)) {
    throw new TypeError(`'type' should be one of 'and' or 'or'; got ${type}`)
  }
  const afterFirstIter = Symbol()
  return (params, b, i, arr) => {
    let { bool, a } =
      params[afterFirstIter] ? params : { bool: type === 'and', a: params }
    const shouldShortCircuit = type === 'or' === bool
    if (!shouldShortCircuit) {
      bool = func(a, b)
      a = b
    }
    if (i === arr.length - 1) return bool // final iteration
    else return { [afterFirstIter]: true, bool, a }
  }
}

myself.iterReducer = "A function for reducing an iterable without having to convert it to an Array first."
const iterReducer = (iter, func, ...initialValue) => {
  const [ hasInitial, initial ] = anyDefault(initialValue)
  let reduced = initial
  let i = 0
  for (const item of iter) { // TODO: use generic 'entries' function
    reduced =
      i === 0 ?
        hasInitial ? func(initial, item, i, iter) : item
      : func(reduced, item, i, iter)
    i += 1
  }
  return reduced
}

myself.anyDefault = "`Un petit` helper function for when you have a parameter that (1) could be *anything* (including undefined, null, false, empty strings and arrays, etc.), AND (2) it's optional, AND (3) you need to know whether a value was provided. One of the most common uses for this function is when you don't use the option unless it's provided, so you don't have to provide an explicit default--but if you do, it will use it. Use like so: `(some, parameters, ...withOption) => { const [ wasProvided, theResult ] = anyDefault(withOption, 42); ...`"
const anyDefault = (param, deef) => {
  const wasProvided = param.length > 0
  return [ wasProvided, wasProvided ? param[0] : deef ]
}

myself.diffsCalculator = "Intended as a helper function for numbers.stdDeviation, but can also be used by itself. The function it returns is the callback for Array.prototype.reduce."
const diffsCalculator = (mean) => 
  (diffs, value) => diffs.concat((value - mean) ** 2)

myself.sum = "Adds two numbers."
const sum = (total, value) => total + value

myself.product = "Multiplies two numbers."
const product = (total, value) => total * value

myself.average = "Calculates the arithmetic mean of two numbers. Generally, you should use numbers.arithmeticMean instead, as this method is likely to introduce rounding errors for larger arrays."
const average = (total, value) => (total + value) / 2

myself.max = "Discards the 'context' parameters supplied to the callback (otherwise Math.max tries to interpret them as candidate numbers)."
const max = (a, b) => Math.max(a, b)

myself.min = "See documentation for 'max'"
const min = (a, b) => Math.min(a, b)

myself.stats = "Calculates min, max, total, and count. Can be used in one pass with a single array, or in a loop to accumulate statistics incrementally (see source for examples)."
const stats = (totalStats, value) => {
  // initial value when collecting stats from multiple arrays
  if (totalStats == null) {
    return statsInit(value)
  }
  // initial value when one is not passed explicitly
  if (typeof totalStats === 'number') {
    totalStats = statsInit(totalStats)
  }
  let { max, min, total, count } = totalStats
  return {
    max: Math.max(value, max),
    min: Math.min(value, min),
    total: total + value,
    count: count + 1,
  }
}

const statsInit = (value) => {
  ;`
  Helper function for 'stats' that allows it to be used incrementally:

      let consolidatedStats
      while (collectingData) {
        let newData = collectMoreData()
        consolidatedStats = newData.reduce(stats, consolidatedStats)
      }

  or in a single pass:

      const consolidatedStats = allTheRawData.reduce(stats)
  ;`
  return {
    max: value,
    min: value,
    total: value,
    count: 1,
  }
}

module.exports = {
  aboutMe: () => myself.aboutMe,
  allAboutMe: () => myself,
  flatten,
  andReducer,
  orReducer,
  iterReducer,
  diffsCalculator,
  anyDefault,
  sum,
  product,
  average,
  max,
  min,
  stats,
}
