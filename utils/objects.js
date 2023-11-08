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
  Object.keys(secondary).forEach(key => {
    let val = secondary[key]
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
  if (a == null) return b ?? {}
  if (b == null) return a
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
      let newDiffs = {
        left,
        leftIndex: i - 1,
        right,
        rightIndex: i,
      }
      allDiffs.push(newDiffs)
    }
    return b
  })
  return allDiffs
}

module.exports = {
  merge,
  allValues,
  allKeys,
  filterKeys,
  oneWayDiff,
  diff,
  multiDiff,
}
