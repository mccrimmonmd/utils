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
  Object.entries(secondary).forEach(([key, val]) => {
    if ( isEmpty(merged[key], alwaysEmpty, neverEmpty) && 
        !isEmpty(val, alwaysEmpty, neverEmpty)) {
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
      if (regex.test(key)) {
        results.add(key)
      }
    })
    return results
  }, new Set())
  return [...keys]
}

const filterKeys = (obj, filter, includeOnMatch=true) => {
  if (obj == null) return obj
  const passesFilter = Array.isArray(filter)
    ? (value) => filter.includes(value) === includeOnMatch
    : (value) => filter.test(value) === includeOnMatch
  let filtered = {}
  Object.keys(obj).forEach(key => {
    if (passesFilter(key)) filtered[key] = obj[key]
  })
  return filtered
}

const oneWayDiff = (a, b) => {
  if (a === b) return {}
  if (a == null || b == null) return a ?? b ?? {}
  return Object.keys(a).reduce((diffs, key) => {
    if (a[key] !== b[key]) diffs[key] = a[key]
    return diffs
  }, {})
}
const diff = (a, b) => {
  let left = oneWayDiff(a, b)
  let right = oneWayDiff(b, a)
  return { left, right }
}
const multiDiff = (listOfObjects) => {
  if (listOfObjects.length <= 1) return []
  let allDiffs = []
  listOfObjects.reduce((a, b, i) => {
    let { left, right } = diff(a, b)
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
  entry = String(entry)
  return /,|\n|"/.test(entry) ? `"${entry.replaceAll('"', '""')}"` : entry
}
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
    listOfObjects.forEach(obj => body.push(
      header.map(key => escapeCsvEntry(obj[key] ?? '')).join(',')
    ))
  }
  let output = [header.map(escapeCsvEntry).join(','), ...body]
  try {
    fs.writeFileSync(path.join(filePath, fileName), output.join('\n'))
  }
  catch (err) {
    console.log(`Error writing data to '${fileName}': ${err}`)
  }
  return output
}

module.exports = {
  merge,
  allValues,
  allKeys,
  filterKeys,
  oneWayDiff,
  diff,
  multiDiff,
  extractNested,
  escapeCsvEntry,
  toCsv,
}
