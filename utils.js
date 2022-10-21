var range = (start=0, stop, step=1) => {
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

var allValues = (listOfObjects, field) => {
  return listOfObjects.reduce((results, obj) => {
    let val = obj[field]
    if (results.includes(val)) {
      return results
    }
    return results.concat(val)
  }, [])
}

var allKeys = (listOfObjects, regex=/(?:)/) => {
  // The empty regex /(?:)/ matches any string
  return listOfObjects.reduce((results, obj) => {
    let newKeys = Object.keys(obj).filter(
      key => regex.test(key) && !results.includes(key)
    )
    return results.concat(newKeys)
  }, [])
}

var deDup = (
  someList, 
  identifier = (item) => item, 
  decider = (itemA, itemB) => itemA
) => {
  return someList.reduce((results, itemA) => {
    let i = results.findIndex(itemB => identifier(itemA) === identifier(itemB))
    if (i >= 0) {
      let itemB = results[i]
      results[i] = decider(itemB, itemA)
    }
    else {
      results.push(itemA)
    }
    return results
  }, [])
}

let objEquals = (objA, objB) => {
  let typeOfA = typeof objA
  if (typeOfA !== typeof objB) {
    return false
  }
  if (typeOfA === 'function') {
    throw new Error('cannot compare equality for functions')
  }
  if (typeOfA === 'object' && objA !== null) {
    let aKeys = Object.keys(objA).sort()
    let bKeys = Object.keys(objB).sort()
    if (aKeys.length !== bKeys.length) {
      return false
    }
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

module.exports = {
  range,
  allValues,
  allKeys,
  deDup,
  objEquals,
} // = require('./utils.js')
