const myself = {} // documentation

myself.flatten = "Concatenates two items that may or may not be arrays, using push instead of concat for speed. You should probably just use Array.prototype.flat instead."
const flatten = (flattened, bump, i) => {
  if (!Array.isArray(flattened)) flattened = [flattened]
  else if (i === 1) {
    // If we're not given an initial value, 'flattened' will be an element of
    // the array being reduced, which we want to avoid mutating, but if we copy
    // on every iteration we lose the speedup gained from using push. We take
    // the first iteration to be i === 1, not 0, because i only equals 0 when
    // an initial value *is* provided.
    flattened = [...flattened]
  }
  if (Array.isArray(bump)) flattened.push(...bump)
  else flattened.push(bump)
  return flattened
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

;`statsInit: Helper function for 'stats' that allows it to be used incrementally:

  var consolidatedStats
  while (collectingData) {
    let newData = collectMoreData()
    consolidatedStats = newData.reduce(stats, consolidatedStats)
  }

or in a single pass:

  var consolidatedStats = allTheRawData.reduce(stats)
`
const statsInit = (value) => {
  return {
    max: value,
    min: value,
    total: value,
    count: 1,
  }
}
myself.stats = "Calculates min, max, total, and count. Can be used with a single array, or in a loop to accumulate statistics incrementally."
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

modules.exports = {
  docs: () => print(myself),
  flatten,
  diffsCalculator,
  sum,
  product,
  average,
  max,
  min,
  stats,
}