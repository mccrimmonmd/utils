module.exports.allValues = (listOfObjects, field) => {
  return listOfObjects.reduce((vals, obj) => {
    var val = obj[field]
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
