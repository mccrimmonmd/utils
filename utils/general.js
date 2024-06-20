const myself = {} // documentation

// Source: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#sequence_generator_range>
// const range = (start, stop, step) =>
//   Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step)

myself.range = "Python-style range function. Generator."
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

myself.ifFunc = "Pure-ish 'if' function with short-circuiting. Just because."
const ifFunc = (condition, onTrue, onFalse=() => null) => {
  let forceTrue = (thingy) => thingy || true
  let result
  ;( condition && forceTrue(result = onTrue()) ) || ( result = onFalse() )
  return result
}

myself.print = "console.dir optimized for the Node.js REPL."
const print = (obj, depth=null, repl=true) => {
  console.dir(obj, { depth })
  return repl ? undefined : obj
}

myself.roundDecimal = "Rounds (towards zero) to a given number of decimal places."
const roundDecimal = (value, places=2) => {
  if (typeof value !== 'number') return value
  if (Number.isInteger(value)) return value
  let magnitude = 10 ** places
  return Math.trunc(value * magnitude) / magnitude
}

myself.isEmpty = "Determines whether a value counts as 'something' or 'nothing'. Used in objects.merge."
const isEmpty = (value, alwaysEmpty=[], neverEmpty=[]) => {
  if (alwaysEmpty.includes(value)) return true
  if (neverEmpty.includes(value)) return false
  
  if (value == null) return true
  if (typeof value === 'boolean') return false
  if (value.length != null) return value.length === 0
  if (value.size != null) return value.size === 0
  if (typeof value === 'object' && Object.keys(value).length === 0) return true
  // ^ Gives false positive on Sets, Maps, etc.
  // (covered by length & size checks, but are there others?)
  // (maybe test for iterability?)
  return !value
}

"Not exported or used, just here as a reminder."
const mapToObject = (someMap) => Object.fromEntries(someMap.entries())

myself.makeGroups = "Sorts a list into caller-determined 'buckets' (default: identity). Returns a Map."
const makeGroups = (someList, idFunc=(item) => item, strong=false) => {
  let cache = new Map()
  let identifier = (item) => {
    if (cache.has(item)) return cache.get(item)
    let id = idFunc(item)
    id = (strong || typeof id === 'symbol') ? id : String(id)
    cache.set(item, id)
    return id
  }
  let groups = new Map()
  someList.forEach(item => {
    let id = identifier(item)
    let group = groups.has(id) ? groups.get(id) : []
    groups.set(id, group.concat([item]))
  })
  return groups
}
myself.deDup = "Removes duplicates. Caller determines what counts as a dupe (default: identity). Uses makeGroups but returns an Array."
const deDup = (
  someList, 
  identifier = (item) => item, 
  decider = (bestSoFar, candidate) => bestSoFar
) => {
  return [...makeGroups(someList, identifier, true).values()]
  .map(group => group.reduce(decider))
}
myself.findDupes = "The compliment of deDup."
const findDupes = (someList, identifier=(item) => item) => {
  return [...makeGroups(someList, identifier, true).values()]
  .filter(group => group.length > 1)
}

myself.textSorter = "Returns function optimized for sorting lists of objects (e.g. by the value of a given key). Handles mixed-case text sensibly but otherwise no smarter than the default sort order. For use with Array.prototype.sort[ed]."
const textSorter = (sortOn, reversed=false) => {
  const sorters = Array.isArray(sortOn) ? sortOn : [sortOn]
  const [ifLess, ifMore] = reversed ? [1, -1] : [-1, 1]
  const resolve = (a, b, sorter) => {
    switch (typeof sorter) {
      case 'function':
        [ a, b ] = [ sorter(a), sorter(b) ]
        break
      case 'string':
      case 'symbol':
        [ a, b ] = [ a[sorter], b[sorter] ]
        break
      case 'undefined':
        break
      case 'object':
        if (sorter === null) break
      default:
        throw new Error(`Unexpected type '${typeof sorter}' for sorter parameter`)
    }
    return [ String(a), String(b) ]
  }
  return (aObj, bObj) => {
    for (const tiebreak of sorters) {
      let [a, b] = resolve(aObj, bObj, tiebreak)
      if (a.toLowerCase() !== b.toLowerCase()) {
        a = a.toLowerCase()
        b = b.toLowerCase()
      }
      if (a !== b) {
        return a < b ? ifLess : ifMore
      }
    }
    return 0
  }
}

myself.arrayOf = "Returns 'length' copies of 'item' (which can be a generator function)."
const arrayOf = (length, item) => Array.from({ length }, (v, i) => {
  if (typeof item === 'function') return item(v, i)
  else if (typeof item === 'object') return structuredClone(item)
  else return item
})
myself.stringOf = "arrayOf but for Strings."
const stringOf = (n, snippet=' ', joinWith='') => {
  return String(joinWith) === ''
    ? String(snippet).repeat(n)
    : arrayOf(n, String(snippet)).join(joinWith)
}

myself.swap = "Swaps two elements of an Array (in-place)."
const swap = (arr, i, j) => {
  // Source: <https://stackoverflow.com/questions/872310/swap-array-elements-in-javascript>
  // [ arr[i], arr[j] ] = [ arr[j], arr[i] ]
  // arr[i] = arr.splice(j, 1, arr[i])[0]
  let swapping = arr[i]
  arr[i] = arr[j]
  arr[j] = swapping
  return arr
}

myself.arrayEquals = "Tests two Arrays to see if they are equal."
// Source: <https://www.freecodecamp.org/news/how-to-compare-arrays-in-javascript/>
const arrayEquals = (a, b) =>
  a.length === b.length &&
  a.every((element, index) => element === b[index])

myself.multilineRegex = "Create a RegEx that spans multiple lines (for commenting)."
// Source: <https://www.dormant.ninja/multiline-regex-in-javascript-with-comments/>
const multilineRegex = (parts, flags='') =>
  new RegExp(parts.map(x => (x instanceof RegExp) ? x.source : x).join(''), flags)

module.exports = {
  docs: () => print(myself),
  range,
  ifFunc,
  print,
  roundDecimal,
  isEmpty,
  makeGroups,
  deDup,
  findDupes,
  textSorter,
  arrayOf,
  stringOf,
  swap,
  arrayEquals,
  multilineRegex,
} // = require('./general')

// for organization (future):
// module.exports = {
  // ...textStuff,
  // ...arrayStuff,
  // other,
  // miscellaneous,
  // functions,
// }
