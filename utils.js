const range = (start=0, stop, step=1) => {
  // TODO: rewrite as an iterator (for large ranges)
  if (stop === undefined) {
    stop = start
    start = 0
  }
  let nums = []
  if (start < stop && step <= 0) return nums
  if (start > stop && step >= 0) return nums
  for (let i = start; (start < stop ? i < stop : i > stop); i += step) {
    nums.push(i)
  }
  return nums
}

const allValues = (listOfObjects, field) => {
  return listOfObjects.reduce((results, obj) => {
    let val = obj[field]
    if (results.includes(val)) {
      return results
    }
    return results.concat(val)
  }, [])
}

const allKeys = (listOfObjects, regex=/(?:)/) => {
  // The empty regex /(?:)/ matches any string
  return listOfObjects.reduce((results, obj) => {
    let newKeys = Object.keys(obj).filter(
      key => regex.test(key) && !results.includes(key)
    )
    return results.concat(newKeys)
  }, [])
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

const filterKeys = (obj, regex) => {
  let keys = Object.keys(obj).filter(key => regex.test(key))
  let miniObj = {}
  keys.forEach(key => {
    miniObj[key] = obj[key]
  })
  return miniObj
}

const objEquals = (objA, objB) => {
  let typeOfA = typeof objA
  if (typeOfA !== typeof objB) {
    return false
  }
  if (typeOfA === 'function') {
    throw new Error('cannot compare equality for functions')
  }
  if (typeOfA === 'number' && isNaN(objA)) {
    return isNaN(objB)
  }
  if (typeOfA === 'object' && objA !== null) {
    if (objB === null) {
      return false
    }
    let aKeys = Object.keys(objA)
    let bKeys = Object.keys(objB)
    if (aKeys.length !== bKeys.length) {
      return false
    }
    aKeys.sort()
    bKeys.sort()
    for (let i = 0; i < aKeys.length; i++) {
      let aKey = aKeys[i]
      if (aKey !== bKeys[i] || !objEquals(objA[aKey], objB[aKey])) {
        return false
      }
    }
    return true
  }
  return objA === objB
}

// Source: <https://www.dormant.ninja/multiline-regex-in-javascript-with-comments/>
const multilineRegex = (...parts) =>
  new RegExp(parts.map(x => (x instanceof RegExp) ? x.source : x).join(''))

module.exports = {
  range,
  allValues,
  allKeys,
  deDup,
  filterKeys,
  objEquals,
  multilineRegex,
} // = require('./utils.js')
