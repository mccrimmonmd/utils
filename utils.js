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
  let uniqueKeys = []
  listOfObjects.forEach((object) => {
    Object.keys(object).forEach((key) => {
      if (regex.test(key) && !uniqueKeys.includes(key)) {
        uniqueKeys = uniqueKeys.concat(key)
      }
    })
  })
  return uniqueKeys
}
