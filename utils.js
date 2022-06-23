module.exports.allValues = (collection, field) => {
  return collection.reduce((vals, obj) => {
    var val = obj[field]
    if (vals.includes(val)) {
      return vals
    }
    return vals.concat(val)
  }, [])
}