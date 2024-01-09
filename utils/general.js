// Source: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#sequence_generator_range>
// const range = (start, stop, step) =>
//   Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step)
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

const print = (obj, depth=null) => {
  console.dir(obj, { depth })
  return obj
}

const isEmpty = (value, alwaysEmpty=[], neverEmpty=[]) => {
  if (alwaysEmpty.includes(value)) return true
  if (neverEmpty.includes(value)) return false
  
  if (value == null) return true
  if (typeof value === 'boolean') return false
  if (value.length != null) return value.length === 0
  if (value.size != null) return value.length === 0
  if (typeof value === 'object' && Object.keys(value).length === 0) return true
  // ^ Gives false positive on Sets, Maps, etc.
  // (covered by length & size checks, but are there others?)
  // (maybe test for iterability?)
  return !value
}

const makeGroups = (someList, idFunc=(item) => item, strong=false) => {
  let identifier = strong
    ? idFunc
    : (item) => {
      let id = idFunc(item)
      return typeof id === 'symbol' ? id : String(id)
    }
  let groups = new Map()
  someList.forEach(item => {
    let id = identifier(item)
    let group = groups.has(id) ? groups.get(id) : []
    groups.set(id, group.concat([item]))
  })
  return groups
}
const deDup = (
  someList, 
  identifier = (item) => item, 
  decider = (bestSoFar, candidate) => bestSoFar
) => {
  return [...makeGroups(someList, identifier, true).values()]
  .map(group => group.reduce(decider))
}
const findDupes = (someList, identifier=(item) => item) => {
  return [...makeGroups(someList, identifier, true).values()]
  .filter(group => group.length > 1)
}

const arrayOf = (length, item) => Array.from({ length }, (v, i) => {
  if (typeof item === 'function') return item(v, i)
  else if (typeof item === 'object') return structuredClone(item)
  else return item
})
const stringOf = (n, snippet=' ', joinWith='') =>
  arrayOf(n, String(snippet)).join(joinWith)

// Source: <https://www.freecodecamp.org/news/how-to-compare-arrays-in-javascript/>
const arrayEquals = (a, b) =>
  a.length === b.length &&
  a.every((element, index) => element === b[index])

// Source: <https://www.dormant.ninja/multiline-regex-in-javascript-with-comments/>
const multilineRegex = (parts, flags='') =>
  new RegExp(parts.map(x => (x instanceof RegExp) ? x.source : x).join(''), flags)

module.exports = {
  range,
  print,
  isEmpty,
  makeGroups,
  deDup,
  findDupes,
  arrayOf,
  stringOf,
  arrayEquals,
  multilineRegex,
}
