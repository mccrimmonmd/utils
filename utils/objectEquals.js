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
    if (!compareBigIntToNumber) return false
    if (typeOfA !== 'bigint' && typeof objB !== 'bigint') return false
    if (Number.isInteger(objA) {
      return BigInt(objA) === objB
    }
    else if (Number.isInteger(objB) {
      return objA === BigInt(objB)
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

    // circular reference tracking
    let wasComparedTo = Symbol.for('circularRefKey')
    let aComps = objA[wasComparedTo]
    let bComps = objB[wasComparedTo]
    if (aComps && bComps && aComps.some(id => bComps.includes(id))) {
      // if these two objects have already been compared, then we know they
      // either contain a circular reference, or their parent object contains a
      // duplicate reference -- either way, they are equal at least to here.
      return true
    }
    else {
      // otherwise, we have to follow the references
      let comparisonId = Symbol()
      objA[wasComparedTo] = aComps ? aComps.concat(comparisonId) : [comparisonId]
      objB[wasComparedTo] = bComps ? bComps.concat(comparisonId) : [comparisonId]
    }
    
    aKeys.sort()
    bKeys.sort()
    return Object.entries(aKeys).every(([i, aKey]) => {
      if (aKey !== bKeys[i]) {
        return false
      }
      return objEquals(objA[aKey], objB[aKey], {compareFuncsWith, compareBigIntToNumber})
      // TODO: test on circularly-nested objects
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol
    })
  }
  return false
}
