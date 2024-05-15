const fs = require('fs')
const path = require('path')

const { isEmpty } = require('./general')

const merge = (
  a, b,
  {
    decider = (one, two) => one, 
    alwaysEmpty = ['undefined', 'null'],
    neverEmpty = [0],
  } = {}
) => {
  let primary = decider(a, b)
  let secondary = primary === a ? b : a
  if (primary == null || secondary == null) return primary ?? secondary
  let merged = { ...primary }
  let options = [alwaysEmpty, neverEmpty]
  Object.entries(secondary).forEach(([key, val]) => {
    if (isEmpty(merged[key], ...options) && !isEmpty(val, ...options)) {
      merged[key] = val
    }
  })
  return merged
}

const recombine = (listOfObjects, getId) => {
  let mapped = listOfObjects.reduce((combined, obj) => {
    let id = getId(obj)
    let referenceObject = combined[id] ?? {}
    for (const [key, val] of Object.entries(obj)) {
    // Object.entries(obj).forEach(([key, val]) => {
      if (val === id) {
        referenceObject[key] = id
        continue
      }
      let bucket = referenceObject[key] ?? []
      if (!bucket.includes(val)) bucket.push(val)
      referenceObject[key] = bucket
    }//)
    combined[id] = referenceObject
    return combined
  }, {})
  return Object.values(mapped)
}

const allValues = (listOfObjects, field) => {
  let values = listOfObjects.reduce(
    (results, obj) => results.add(obj[field]), 
    new Set()
  )
  return [...values]
}

const allKeys = (listOfObjects, regex=/(?:)/) => {
  // The empty regex /(?:)/ matches any string
  let keys = listOfObjects.reduce((results, obj) => {
    if (obj == null) return results
    Object.keys(obj).forEach(key => {
      if (regex.test(key)) results.add(key)
    })
    return results
  }, new Set())
  return [...keys]
}

const filterObject = (
  obj,
  filter,
  {
    filterOn = 'keys',
    includeOnMatch = true,
  } = {}
) => {
  if (obj == null) return obj
  const passesFilter = Array.isArray(filter)
    ? (value) => filter.includes(value) === includeOnMatch
    : (value) => filter.test(value) === includeOnMatch
  let filtered = Object.entries(obj).filter(([key, value]) => {
    let candidate = filterOn === 'keys' ? key : value
    return passesFilter(candidate)
  })
  return Object.fromEntries(filtered)
}

const oneWayDiff = (a, b) => {
  let diffs
  let sames
  if (a === b) [diffs, sames] = [{}, { ...a }]
  else if (a == null) [diffs, sames] = [{ ...b }, {}]
  else if (b == null) [diffs, sames] = [{ ...a }, {}]
  else {
    [diffs, sames] = Object.entries(a).reduce(([diff, same], [key, val]) => {
      if (b[key] === val) same[key] = val
      else diff[key] = val
      return [diff, same]
    }, [{}, {}])
  }
  return {
    diffs,
    sames,
  }
}
const biDiff = (a, b) => {
  let left = oneWayDiff(a, b).diffs
  let right = oneWayDiff(b, a).diffs
  return { left, right }
}
const intersection = (listOfObjects) => {
  if (listOfObjects == null || !listOfObjects.length) return {}
  return listOfObjects.reduce((shared, obj) =>
    oneWayDiff(shared, obj).sames
  )
}
// TODO: ~~make results true union/intersection/symmetric difference~~ figure
// out what the heck 'multiDiff' even means; why does anyone need this function?
const multiDiff = (listOfObjects) => {
  if (listOfObjects.length <= 1) return []
  let allDiffs = []
  listOfObjects.reduce((a, b, i) => {
    let { left, right } = biDiff(a, b)
    if (Object.keys(left).length || Object.keys(right).length) {
      allDiffs.push({
        left,
        leftIndex: i - 1,
        right,
        rightIndex: i,
      })
    }
    return b
  })
  return allDiffs
}

const extractNested = (obj) => {
  let flat = {}
  let nested = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (value != null && typeof value === 'object') {
      nested[key] = value
    }
    else {
      flat[key] = value
    }
  })
  return { flat, nested }
}

const escapeCsvEntry = (entry) => {
  entry = String(entry ?? '')
  return /,|\n|"/.test(entry) ? `"${entry.replaceAll('"', '""')}"` : entry
}
const toCsv = (listOfObjects, fileName='output.csv', filePath='./') => {
  const makeLine = (header, obj=false) => {
    return header.map(key => escapeCsvEntry(obj ? obj[key] : key)).join(',')
  }
  let header = []
  let body = []
  if (listOfObjects.length === 0) {
    console.warn(`No data! '${fileName}' will be empty.`)
  }
  else {
    let allKeys = [].concat(...listOfObjects.map(Object.keys))
    let uniqueKeys = new Set(allKeys)
    header = [...uniqueKeys]
    listOfObjects.forEach(obj => body.push(makeLine(header, obj)))
  }
  let output = [makeLine(header), ...body]
  try {
    fs.writeFileSync(path.join(filePath, fileName), output.join('\n'))
  }
  catch (err) {
    console.log(`Error writing data to '${fileName}': ${err}`)
    let extra = output.length - 100
    let elided = ''
    if (extra > 0) {
      output = output.slice(0, 100)
      elided = `... ${extra} more items`
    }
    console.debug('Attempted output:\n', output, elided)
  }
  return output
}

const valOpts = { filterOn: 'values' }
const excludeOpts = { includeOnMatch: false }
const excludeValOpts = { filterOn: 'values', includeOnMatch: false }

module.exports = {
  merge,
  allValues,
  allKeys,
  filter: {
    object: filterObject,
    many: (listOfObjects, filter, options={}) => {
      return listOfObjects.map(obj => filterObject(obj, filter, options)
    },
    byKeys: (obj, filter) => filterObject(obj, filter),
    byValues: (obj, filter) => filterObject(obj, filter, valOpts),
    excludeKeys: (obj, filter) => filterObject(obj, filter, excludeOpts),
    excludeValues: (obj, filter) => filterObject(obj, filter, excludeValOpts),
  },
  oneWayDiff,
  diff: biDiff,
  multiDiff,
  extractNested,
  escapeCsvEntry,
  toCsv,
}
