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
