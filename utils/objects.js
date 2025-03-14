const fs = require('fs')
const path = require('path')

const myself = {} // documentation
const {
  print,
  isEmpty,
  isIterable,
  getSorter,
  compareItersBy,
} = require('./general')
const { sum, product } = require('./numbers')

myself.merge = "Merges a secondary or 'fallback' object into a primary or 'reference' object. Returns a new object that matches the primary, plus all non-empty values from the secondary that are empty in the primary. Uses general.isEmpty to determine what counts as empty."
const merge = (
  a, b,
  {
    decider = (first, second) => first, 
    alwaysEmpty = ['undefined', 'null'],
    neverEmpty = [0],
  } = {}
) => {
  if (a == null || b == null) return a ?? b
  let primary = decider(a, b)
  let secondary = primary === a ? b : a
  let merged = { ...primary }
  let options = [alwaysEmpty, neverEmpty]
  for (const [key, val] of Object.entries(secondary)) {
    if (isEmpty(merged[key], ...options) && !isEmpty(val, ...options)) {
      merged[key] = val
    }
  }
  return merged
}

myself.recombine = "Sort of like Python's 'zip' function, generalized for Objects: transforms [{ id: xid, key: xVal1 }, { id: xid, key: xVal2 }, { id: yid, otherKey: yVal1 }, ...] into [{ id: xid, key: [xVal1, xVal2, ...] }, { id: yid, otherKey: [yVal1, ...] }, ...]"
const recombine = (listOfObjects, getKey, showDuplicates = true) => {
  const mapped = listOfObjects.reduce((masterObj, obj) => {
    const masterKey = getKey(obj)
    const combinedObj = masterObj[masterKey] ?? {}
    for (const [key, val] of Object.entries(obj)) {
      if (val === masterKey) {
        combinedObj[key] = val
        continue
      }
      let bucket = combinedObj[key] ?? []
      if (showDuplicates || !bucket.includes(val)) bucket.push(val)
      combinedObj[key] = bucket
    }
    masterObj[masterKey] = combinedObj
    return masterObj
  }, {})
  return Object.values(mapped)
}

myself.allValues = "Returns an array of every unique value set to the given key among the provided list of objects."
const allValues = (listOfObjects, field) => {
  return [ ...new Set(listOfObjects.map(obj => obj[field])) ]
}

myself.allKeys = "Returns an array of every unique key among the objects provided. Takes an optional regular expression to filter the results."
const allKeys = (listOfObjects, regex = /(?:)/) => {
  // The empty regex /(?:)/ matches any string
  const uniqueKeys = new Set(listOfObjects.flatMap(Object.keys))
  return [...uniqueKeys].filter(key => regex.test(key))
}

myself.filter = {
  object: "Takes an object and returns a new object containing only the keys (or values) that match (or don't match) the provided filter. The filter can be a regular expression or an iterable."
}
const filterObject = (
  obj,
  filter,
  {
    filterOn = 'keys',
    includeOnMatch = true,
  } = {}
) => {
  if (obj == null) return obj
  let passesFilter
  if (isIterable(filter)) {
    filter = new Set(filter)
    passesFilter = (value) => filter.has(value) === includeOnMatch
  }
  else if (filter instanceof RegExp) {
    passesFilter = (value) => filter.test(value) === includeOnMatch
  }
  else {
    console.dir(filter)
    throw new TypeError('filter must be either an iterable or a regular expression')
  }
  const filtered = Object.entries(obj).filter(([key, value]) => {
    const candidate = filterOn === 'keys' ? key : value
    return passesFilter(candidate)
  })
  return Object.fromEntries(filtered)
}

// TODO: export, document
const compareBy = (type) => (a, b, options = {}) => {
  const filterOn = options.filterOn ?? 'keys'
  const diffOn = filterOn === 'keys' ? Object.keys : Object.values
  const diffs = compareItersBy(type)(diffOn(a), diffOn(b))
  a = filterObject(a, diffs, options)
  b = filterObject(b, diffs, options)
  return {
    ...a,
    ...b
  }
}
// <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#set_composition>
// myself.compareBy = 'diff, both, either, xor: ...'
const compareDiff   = compareBy('difference')
const compareBoth   = compareBy('intersection')
const compareEither = compareBy('union')
const compareXor    = compareBy('symmetricDifference')

myself.extractNested = "Flattens (by one) the given object, returning the flattened values and, separately, any remaining nested values."
const extractNested = (obj) => {
  let flat = {}
  let nested = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value != null && typeof value === 'object') {
      nested[key] = value
    }
    else {
      flat[key] = value
    }
  }
  return { flat, nested }
}

myself.escapeCsvEntry = "Helper function for 'toCsv'. Converts an object to a string and escapes any quotes, commas, or newlines."
const escapeCsvEntry = (entry) => {
  entry = String(entry ?? '')
  return /,|\n|"/.test(entry) ? `"${entry.replaceAll('"', '""')}"` : entry
}
myself.toCsv = "Converts a list of objects into a CSV file and returns the result as a string. Also writes the output to the given destination ('./output.csv' by default), unless fileName or filePath are set to null."
const toCsv = (
  listOfObjects,
  {
    fileName = 'output.csv',
    filePath = './',
    sortHeader = false
  } = {}
) => {
  const makeLine = (header, obj = null) => {
    return header.map(key => escapeCsvEntry(obj ? obj[key] : key)).join(',')
  }
  let header = []
  let body = []
  if (listOfObjects.length === 0) {
    console.warn('No data! Output will be empty.')
  }
  else {
    header = allKeys(listOfObjects)
    if (sortHeader) header.sort(getSorter())
    for (const obj of listOfObjects) body.push(makeLine(header, obj))
  }
  let output = [makeLine(header), ...body]
  if (fileName != null && filePath != null) {
    try {
      fs.writeFileSync(path.join(filePath, fileName), output.join('\n'))
    }
    catch (err) {
      console.log(`Error writing data to '${fileName}': ${err}`)
      let extra = output.length - 100
      let elided = ''
      if (extra > 0) {
        output = output.slice(0, 100)
        elided = `... ${extra} more items`
      }
      console.debug('Attempted output:\n', output, elided)
    }
  }
  return output
}

myself.count = "Calculates the total of a list of objects. The number each object represents is determined by the given function (default Number())."
const count = (listOfObjects, getValue = (obj) => Number(obj)) =>
  listOfObjects.map(getValue).reduce(sum, 0)

myself.multiply = "Same as count, but with multiplication instead of addition."
const multiply = (listOfObjects, getValue = (obj) => Number(obj)) =>
  listOfObjects.map(getValue).reduce(product, 1)

myself.filter.many = "Convenience function for mapping filter.object to a list of multiple objects."
myself.filter.xxxx = "Convenience functions for using filter.object with preset options: byKeys (default), byValues, excludeKeys, excludeValues" 

const valOpts = { filterOn: 'values' }
const excludeOpts = { includeOnMatch: false }
const excludeValOpts = { filterOn: 'values', includeOnMatch: false }

module.exports = {
  docs: () => print(myself),
  merge,
  recombine,
  allValues,
  allKeys,
  filter: {
    object: filterObject,
    many: (listOfObjects, filter, options) =>
      listOfObjects.map(obj => filterObject(obj, filter, options)),
    byKeys: (obj, filter) => filterObject(obj, filter),
    byValues: (obj, filter) => filterObject(obj, filter, valOpts),
    excludeKeys: (obj, filter) => filterObject(obj, filter, excludeOpts),
    excludeValues: (obj, filter) => filterObject(obj, filter, excludeValOpts),
  },
  extractNested,
  escapeCsvEntry,
  toCsv,
  count,
  multiply,
}
