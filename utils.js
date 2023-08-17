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

const isEmpty = (value) => {
  if (value == null) return true
  if (value.length != null && value.length === 0) return true
  if (typeof value === 'object') {
    return Object.keys(value).length === 0
  }
  return !value
}
const mergeObjects = (a, b, decider = (one, two) => one) => {
  if (a == null || b == null) return a ?? b
  let primary = decider(a, b)
  let secondary = primary === a ? b : a
  let merged = { ...primary }
  Object.keys(secondary).forEach(key => {
    let val = secondary[key]
    if (isEmpty(merged[key]) && !isEmpty(val)) {
      merged[key] = val
    }
  })
  return merged
}

const allValues = (listOfObjects, field) => {
  let values = listOfObjects.reduce((results, obj) => {
    results.add(obj[field])
    return results
  }, new Set())
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
  .map(group => group.reduce(decider, group[0]))
}
const findDupes = (someList, identifier = (item) => item) => {
  return [...makeGroups(someList, identifier, true).values()]
  .filter(group => group.length > 1)
}

const diff = (a, b) => {
  let left = Object.keys(a).reduce((diffs, key) => {
    if (a[key] !== b[key]) diffs[key] = a[key]
    return diffs
  }, {})
  let right = Object.keys(b).reduce((diffs, key) => {
    if (b[key] !== a[key]) diffs[key] = b[key]
    return diffs
  }, {})
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
  allValues,
  allKeys,
  filterKeys,
  deDup,
  findDupes,
  arrayEquals,
  multilineRegex,
  random,
} // = require('./utils.js')
