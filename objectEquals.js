module.exports = (
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
    if (compareBigIntToNumber) {
      let typeOfB = typeof objB
      try {
        if (typeOfA === 'bigint' && typeOfB === 'number') {
          return objA === BigInt(objB)
        }
        else if (typeOfA === 'number' && typeOfB === 'bigint') {
          return BigInt(objA) === objB
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
    let hasBeenSeen = Symbol.for('circularRefKey')
    let options = { allFuncsEqual, compareBigIntToNumber }
    return Object.entries(aKeys).every(([i, aKey]) => {
      if (aKey !== bKeys[i]) {
        return false
      }
      let aChild = objA[aKey]
      let bChild = objB[aKey]
      let aSeen = aChild[hasBeenSeen]
      let bSeen = bChild[hasBeenSeen]
      if (aSeen && bSeen) {
        return aSeen.some(id => bSeen.includes(id))
      }
      let uid = Symbol()
      aChild[hasBeenSeen] = aSeen ? aSeen.concat(uid) : [uid]
      bChild[hasBeenSeen] = bSeen ? bSeen.concat(uid) : [uid]
      return objEquals(aChild, bChild, options)
      // TODO: test on circularly-nested objects
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol
    })
  }
  return false
}
