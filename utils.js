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
  return keys.reduce((miniObj, key) => {
    miniObj[key] = obj[key]
    return miniObj
  }, {})
}

const objEquals = (
  objA,
  objB, 
  {
    compareFuncsWith = false,
    compareBigIntToNumber = false
  } = {}
) => {
  if (objA === objB) {
    return true
  }
  let typeOfA = typeof objA
  if (typeOfA !== typeof objB) {
    if (compareBigIntToNumber && (typeOfA === 'bigint' || typeOfA === 'number')) {
      try {
        if (typeOfA === 'number') {
          return BigInt(objA) === objB
        } else {
          return typeof objB === 'number' && BigInt(objB) === objA
        }
      } catch (err) {
        if (err instanceof RangeError) {
          return false
        } else {
          throw err
        }
      }
    }
    return false
  }
  if (typeOfA === 'number' && isNaN(objA)) {
    return isNaN(objB)
  }
  if (typeOfA === 'function') {
    if (!compareFuncsWith) {
      throw new Error(
        'function comparison is disabled, set `compareFuncsWith` to enable\n' + 
        '  (possible values: `toString`, `noneEqual`, `allEqual` [default])'
      )
    } else if (compareFuncsWith === 'toString') {
      return objA.toString() === objB.toString()
    } else if (compareFuncsWith === 'noneEqual') {
      return false
    } else {
      return true
    }
  }
  if (typeOfA === 'object') {
    if (objA === null) {
      return false
    }
    if (Array.isArray(objA) !== Array.isArray(objB)) {
      return false
    }
    let aKeys = Object.keys(objA)
    let bKeys = Object.keys(objB)
    if (aKeys.length !== bKeys.length) {
      return false
    }
    aKeys.sort()
    bKeys.sort()
    return [...aKeys.entries()].every(([i, aKey]) => 
      // TODO: will crash on circularly-nested objects
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
      aKey === bKeys[i] && objEquals(objA[aKey], objB[aKey], allFuncsEqual)
    )
  }
  return false
}

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
  objEquals,
  multilineRegex,
  randomObject,
  ...random,
} // = require('./utils.js')
