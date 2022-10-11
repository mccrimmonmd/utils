module.exports.allValues = (listOfObjects, field) => {
  return listOfObjects.reduce((vals, obj) => {
    let val = obj[field]
    if (vals.includes(val)) {
      return vals
    }
    return vals.concat(val)
  }, [])
}

module.exports.allKeys = (listOfObjects, regex=/(?:)/) => {
  return listOfObjects.reduce((vals, obj) => {
    let newVals = Object.keys(obj).filter((key) => {
      return regex.test(key) && !vals.includes(key)
    })
    return vals.concat(newVals)
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
		if (aKeys.length !== bKeys) {
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
module.exports.objEquals = objEquals
