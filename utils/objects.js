const fs = require('fs')
const path = require('path')

const { isEmpty } = require('./general')

const merge = (
  a, b, 
  decider = (one, two) => one, 
  alwaysEmpty = ['undefined', 'null'],
  neverEmpty = [0]
) => {
  if (a == null || b == null) return a ?? b
  let primary = decider(a, b)
  let secondary = primary === a ? b : a
  let merged = { ...primary }
  let options = [alwaysEmpty, neverEmpty]
  Object.entries(secondary).forEach(([key, val]) => {
    if (isEmpty(merged[key], ...options) && !isEmpty(val, ...options)) {
      merged[key] = val
    }
  })
  return merged
}

const allValues = (listOfObjects, field) => {
  let values = listOfObjects.reduce(
    (results, obj) => results.add(obj[field]), 
    new Set()
  )
  return [...values]
}

const allKeys = (listOfObjects, regex=/(?:)/) => {
  // The empty regex /(?:)/ matches any string
  let keys = listOfObjects.reduce((results, obj) => {
    if (obj == null) return results
    Object.keys(obj).forEach(key => {
      if (regex.test(key)) results.add(key)
    })
    return results
  }, new Set())
  return [...keys]
}

const filterObject = (
  obj,
  filter,
  {
    filterOn = 'keys',
    includeOnMatch = true
  } = {}
) => {
  if (obj == null) return obj
  const passesFilter = Array.isArray(filter)
    ? (value) => filter.includes(value) === includeOnMatch
    : (value) => filter.test(value) === includeOnMatch
  let filtered = {}
  Object.entries(obj).forEach(([key, value]) => {
    let candidate = filterOn === 'keys' ? key : value
    if (passesFilter(candidate)) filtered[key] = obj[key]
  })
  return filtered
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

const extractNested = (obj) => {
  let flat = {}
  let nested = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (value != null && typeof value === 'object') {
      nested[key] = value
    }
    else {
      flat[key] = value
    }
  })
  return { flat, nested }
}

const escapeCsvEntry = (entry) => {
  entry = String(entry ?? '')
  return /,|\n|"/.test(entry) ? `"${entry.replaceAll('"', '""')}"` : entry
}
const makeLine = (header, obj=false) =>
  header.map(key => escapeCsvEntry(obj ? obj[key] : key))
  .join(',')
const toCsv = (listOfObjects, fileName='output.csv', filePath='./') => {
  let header = []
  let body = []
  if (listOfObjects.length === 0) {
    console.warn(`No data! '${fileName}' will be empty.`)
  }
  else {
    let allKeys = [].concat(...listOfObjects.map(Object.keys))
    let uniqueKeys = new Set(allKeys)
    header = [...uniqueKeys]
    listOfObjects.forEach(obj => body.push(makeLine(header, obj)))
  }
  let output = [makeLine(header), ...body]
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
  return output
}

module.exports = {
  merge,
  allValues,
  allKeys,
  filter: {
    object: filterObject,
    byKeys: (obj, filter) => filterObject(obj, filter),
    byValues: (obj, filter) => filterObject(obj, filter, { filterOn: 'values' }),
    excludeKeys: (obj, filter) =>
      filterObject(obj, filter, { includeOnMatch: false }),
    excludeValues: (obj, filter) =>
      filterObject(obj, filter, { filterOn: 'values', includeOnMatch: false }),
  },
  oneWayDiff,
  diff: biDiff,
  multiDiff,
  extractNested,
  escapeCsvEntry,
  toCsv,
}
