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
  let filteredObj = {}
  Object.keys(obj).forEach(key => {
    if (passesFilter(key)) filteredObj[key] = obj[key]
  })
  return filteredObj
}

const makeGroups = (someList, idFunc = (item) => item, strong = false) => {
  let identifier = strong
    ? idFunc
    : (item) => {
      let id = idFunc(item)
      return typeof id === 'symbol' ? id : String(id)
    }
  let groups = new Map()
  someList.forEach((item) => {
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
) => [...makeGroups(someList, identifier, true).values()].map(
    group => group.reduce(decider, group[0])
  )

const findDupes = (someList, identifier = (item) => item) => {
  return [...makeGroups(someList, identifier, true).values()]
  .filter(group => group.length > 1)
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
