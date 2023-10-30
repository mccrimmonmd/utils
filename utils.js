// Array.from({ length: n }, (v, i) => i)
// [...Array(n).keys()]
const range = function* (start=0, stop, step=1) {
  if (stop === undefined) {
    stop = start
    start = 0
  }
  if (start < stop && step <= 0) return
  if (start > stop && step >= 0) return
  for (let i = start; (start < stop ? i < stop : i > stop); i += step) {
    yield i
  }
}

const print = (obj, depth=null) => {
  console.dir(obj, { depth })
  return obj
}

const isEmpty = (value, alwaysEmpty=[], neverEmpty=[]) => {
  if (alwaysEmpty.includes(value)) return true
  if (neverEmpty.includes(value)) return false
  
  if (value == null) return true
  if (typeof value === 'boolean') return false
  if (typeof value === 'object' && Object.keys(value).length === 0) return true
  if (value.length === 0) return true
  if (value.size === 0) return true
  return !value
}
const mergeObjects = (
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

const makeGroups = (someList, idFunc = (item) => item, strong = false) => {
  let identifier = strong
    ? idFunc
    : (item) => {
      let id = idFunc(item)
      return typeof id === 'symbol' ? id : String(id)
    }
  let groups = new Map()
  someList.forEach(item => {
    let id = identifier(item)
    let group = groups.has(id) ? groups.get(id) : []
    groups.set(id, group.concat([item]))
  })
  return groups
}
const deDup = (
  someList, 
  identifier = (item) => item, 
  decider = (bestSoFar, candidate) => candidate
) => {
  return [...makeGroups(someList, identifier, true).values()]
  .map(group => group.reduce(decider))
}
const findDupes = (someList, identifier = (item) => item) => {
  return [...makeGroups(someList, identifier, true).values()]
  .filter(group => group.length > 1)
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

// Source: <https://www.freecodecamp.org/news/how-to-compare-arrays-in-javascript/>
const arrayEquals = (a, b) =>
  a.length === b.length &&
  a.every((element, index) => element === b[index])

// Source: <https://www.dormant.ninja/multiline-regex-in-javascript-with-comments/>
const multilineRegex = (parts, flags='') =>
  new RegExp(parts.map(x => (x instanceof RegExp) ? x.source : x).join(''), flags)

const random = require('./random')

module.exports = {
  range,
  print,
  isEmpty,
  mergeObjects,
  allValues,
  allKeys,
  filterKeys,
  makeGroups,
  deDup,
  findDupes,
  oneWayDiff,
  diff,
  multiDiff,
  arrayEquals,
  multilineRegex,
  random,
} // = require('./utils.js')
