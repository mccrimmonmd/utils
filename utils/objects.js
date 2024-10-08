const fs = require('fs')
const path = require('path')

const myself = {} // documentation
const { print, isEmpty, textSorter } = require('./general')
const { sum, product } = require('./numbers')

myself.merge = "Merges a secondary or 'fallback' object into a primary or 'reference' object. Returns a new object that matches the primary, plus all non-empty values from the secondary that are empty in the primary. Uses general.isEmpty to determine what counts as empty."
const merge = (
  a, b,
  {
    decider = (one, two) => one, 
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

myself.recombine = "Tranforms [{ id: xid, key: val1 }, { id: xid, key: val2 }, { id: yid, key: val3 }, ...] into [{ id: xid, key: [val1, val2] }, { id: yid, key: [val3] }, ...]"
const recombine = (listOfObjects, getId, showDuplicates = true) => {
  let mapped = listOfObjects.reduce((combined, obj) => {
    let id = getId(obj)
    let referenceObject = combined[id] ?? {} // masterObject?
    for (const [key, val] of Object.entries(obj)) {
      if (val === id) {
        referenceObject[key] = val
        continue
      }
      let bucket = referenceObject[key] ?? []
      if (showDuplicates || !bucket.includes(val)) bucket.push(val)
      referenceObject[key] = bucket
    }
    combined[id] = referenceObject
    return combined
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
  let uniqueKeys = new Set( [].concat(...listOfObjects.map(Object.keys)) )
  return [...uniqueKeys].filter(key => regex.test(key))
}

myself.filter = {}
myself.filter.object = "Takes an object and returns a new object containing only the keys (or values) that match (or don't match) the provided filter. The filter can be a regular expression or an array."
const filterObject = (
  obj,
  filter,
  {
    filterOn = 'keys',
    includeOnMatch = true,
  } = {}
) => {
  if (obj == null) return obj
  const passesFilter = Array.isArray(filter)
    ? (value) => filter.includes(value) === includeOnMatch
    : (value) => filter.test(value) === includeOnMatch
  let filtered = Object.entries(obj).filter(([key, value]) => {
    let candidate = filterOn === 'keys' ? key : value
    return passesFilter(candidate)
  })
  return Object.fromEntries(filtered)
}

const oneWayDiff = (a, b) => {
  let diffs
  let sames
  if (a === b) [diffs, sames] = [{}, { ...a }]
  else if (a == null) [diffs, sames] = [{ ...b }, {}]
  else if (b == null) [diffs, sames] = [{ ...a }, {}]
  else {
    [diffs, sames] = Object.entries(a).reduce(([diff, same], [key, val]) => {
      if (b[key] === val) same[key] = val
      else diff[key] = val
      return [diff, same]
    }, [{}, {}])
  }
  return {
    diffs,
    sames,
  }
}
const biDiff = (a, b) => {
  let left = oneWayDiff(a, b).diffs
  let right = oneWayDiff(b, a).diffs
  return { left, right }
}
const intersection = (listOfObjects) => {
  if (listOfObjects == null || !listOfObjects.length) return {}
  return listOfObjects.reduce((shared, obj) =>
    oneWayDiff(shared, obj).sames
  )
}
// TODO: ~~make results true union/intersection/symmetric difference~~ figure
// out what the heck 'multiDiff' even means; why does anyone need this function?
// Possible A: outliers! I think I wanted a way to find values that stood out
// among a group of similar objects (i.e. reduce it to just its
// "differences"). I should use general.makeGroups for that...
const multiDiff = (listOfObjects) => {
  if (listOfObjects.length <= 1) return []
  let allDiffs = []
  listOfObjects.reduce((a, b, i) => {
    let { left, right } = biDiff(a, b)
    if (Object.keys(left).length || Object.keys(right).length) {
      allDiffs.push({
        left,
        leftIndex: i - 1,
        right,
        rightIndex: i,
      })
    }
    return b
  })
  return allDiffs
}

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
  const makeLine = (header, obj = false) => {
    return header.map(key => escapeCsvEntry(obj ? obj[key] : key)).join(',')
  }
  let header = []
  let body = []
  if (listOfObjects.length === 0) {
    console.warn('No data! Output will be empty.')
  }
  else {
    header = allKeys(listOfObjects)
    if (sortHeader) header.sort(textSorter())
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
    many: (listOfObjects, filter, options) => {
      return listOfObjects.map(obj => filterObject(obj, filter, options))
    },
    byKeys: (obj, filter) => filterObject(obj, filter),
    byValues: (obj, filter) => filterObject(obj, filter, valOpts),
    excludeKeys: (obj, filter) => filterObject(obj, filter, excludeOpts),
    excludeValues: (obj, filter) => filterObject(obj, filter, excludeValOpts),
  },
  oneWayDiff,
  diff: biDiff,
  multiDiff,
  extractNested,
  escapeCsvEntry,
  toCsv,
  count,
  multiply,
}

