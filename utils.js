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
    Object.keys(obj).forEach((key) => {
      if (regex.test(key)) {
        results.add(key)
      }
    })
    return results
  }, new Set())
  return [...keys]
}

const filterKeys = (obj, filter, includeOnMatch=true) => {
  const passesFilter = Array.isArray(filter)
    ? (value) => filter.includes(value) === includeOnMatch
    : (value) => filter.test(value) === includeOnMatch
  let filteredObj = {}
  Object.keys(obj).forEach(key => {
    if (passesFilter(key)) filteredObj[key] = obj[key]
  })
  return filteredObj
}

const deDup = (
  someList, 
  identifier = (item) => item, 
  decider = (itemA, itemB) => itemB
) => {
  return someList.reduce((results, itemA) => {
    let i = results.findIndex(itemB => identifier(itemA) === identifier(itemB))
    if (i >= 0) {
      let itemB = results[i]
      results[i] = decider(itemA, itemB)
    }
    else {
      results.push(itemA)
    }
    return results
  }, [])
}

const findDupes = (someList) => {
  let all = new Set()
  return someList.reduce((dupes, item) => {
    if (all.has(item)) dupes.push(item)
    all.add(item)
    return dupes
  }, [])
}

// Source: <https://www.freecodecamp.org/news/how-to-compare-arrays-in-javascript/>
const arrayEquals = (a, b) =>
  a.length === b.length &&
  a.every((element, index) => element === b[index])

// Source: <https://www.dormant.ninja/multiline-regex-in-javascript-with-comments/>
// TODO: add some way of setting flags e.g. `ignoreCase = parts.some(x => (x instanceof RegExp) ? x.ignoreCase : false)`
const multilineRegex = (...parts) =>
  new RegExp(parts.map(x => (x instanceof RegExp) ? x.source : x).join(''))

var random = require('./random')
var randomObject = require('./randomObject')
module.exports = {
  range,
  allValues,
  allKeys,
  deDup,
  filterKeys,
  multilineRegex,
  randomObject,
  ...random,
} // = require('./utils.js')
