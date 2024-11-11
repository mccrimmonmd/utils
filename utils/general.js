const myself = {} // documentation

const backToWork = require('./BACK TO WORK')

myself.range = "Python-style range function. Generator."
// Alternate version (source: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#sequence_generator_range>)
// const range = (start, stop, step) =>
//   Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step)
// Using Array.from is simpler, but a generator uses no heap space, so
// it can accomodate very large (or even infinite!) ranges.
const range = function* (start = 0, stop, step = 1) {
  const big = typeof start === 'bigint'
  const zero = big ? 0n : 0
  if (big && step === 1) step = 1n
  if (stop === undefined) {
    stop = start
    start = zero
  }
  if (start < stop && step <= zero) return
  if (start > stop && step >= zero) return
  for (let i = start; (start < stop ? i < stop : i > stop); i += step) {
    yield i
  }
}

myself.zip = "Python-style zip function: combines a list of arrays into a list of pairs/triplets/etc. Takes optional parameters for padding the results when the input arrays are different lengths; if padding is disabled, the output will be the length of the shortest input array. (Note: normally I would use a single parameter with a default of 'false' or similar, but because padWith can potentially be anything, including false and undefined, two separate parameters are necessary.)"
const zip = (arrays, { padResults = false, padWith } = {}) => {
  const zipped = []
  if (!arrays.length) return zipped
  const len = arrays
    .map(array => array.length)
    .reduce(padResults ? Math.max : Math.min)
  for (const i of range(len)) {
    let group = []
    for (const array of arrays) {
      let val = (padResults && i >= array.length) ? padWith : array[i]
      group.push(val)
    }
    zipped.push(group)
  }
  return zipped
}

myself.ifFunc = "Pure-ish 'if' function with short-circuiting. Just because. (Only 'ish' because, without the side effect of assignment, the return value of the executed branch would be lost, making the construct useless unless the branches themselves had side effects.)"
const ifFunc = (condition, onTrue, onFalse = () => null) => {
  let forceTrue = (thingy) => thingy || true
  let result
  ;( condition && forceTrue(result = onTrue()) ) || ( result = onFalse() )
  return result
}

myself.isTruthy = "Javascript's truthiness rules are obnoxious and I always second-guess myself when trying to remember them."
const isTruthy = (thing) => thing ? 'yes' : 'no'

myself.print = "console.dir optimized for the Node.js REPL."
const print = (obj, depth = null, repl = true) => {
  console.dir(obj, { depth })
  return repl ? undefined : obj
}

myself.isEmpty = "Determines whether a value counts as 'something' or 'nothing'. Used in objects.merge."
const isEmpty = (value, alwaysEmpty = [], neverEmpty = []) => {
  if (alwaysEmpty.includes(value)) return true
  if (neverEmpty.includes(value)) return false
  
  if (value == null) return true
  if (typeof value === 'boolean') return false
  if (value.length != null) return value.length === 0
  if (value.size != null) return value.size === 0
  if (typeof value[Symbol.iterator] === 'function') {
    for (const _ of value) return false
    return true
  }
  if (typeof value === 'object' && Object.keys(value).length === 0) return true
  // TODO: anything else to test? Empty function?
  // if (typeof value === 'function') {
  //   return /\(\)=>{(return)?}/.test(value.toString().replaceAll(/\s/g, '')
  // }
  return !value
}

"Not exported or used, just here as a reminder."
const mapToObject = (someMap) => Object.fromEntries(someMap.entries())

myself.makeGroups = "Sorts an iterable into caller-determined 'buckets' (default: identity). Returns a Map."
const makeGroups = (iterable, idFunc = (item) => item, strong = true) => {
  let cache = new Map()
  let identifier = (item) => {
    if (cache.has(item)) return cache.get(item)
    let id = idFunc(item)
    id = (strong || typeof id === 'symbol') ? id : String(id)
    cache.set(item, id)
    return id
  }
  let groups = new Map()
  for (const item of iterable) {
    let id = identifier(item)
    let group = groups.has(id) ? groups.get(id) : []
    groups.set(id, group.concat([item]))
  }
  return groups
}
myself.deDup = "Removes duplicates. Caller determines what counts as a dupe (default: identity). Uses makeGroups but returns an Array."
const deDup = (
  iterable, 
  identifier = (item) => item, 
  decider = (bestSoFar, candidate) => bestSoFar
) => {
  return [...makeGroups(iterable, identifier).values()]
  .map(group => group.reduce(decider))
}
myself.findDupes = "The complement of deDup."
const findDupes = (iterable, identifier = (item) => item) => {
  return [...makeGroups(iterable, identifier).values()]
  .filter(group => group.length > 1)
}
myself.findUniques = "The complement of deDup's complement."
const findUniques = (iterable, identifier = (item) => item) => {
  return [...makeGroups(iterable, identifier).values()]
  .filter(group => group.length === 1)
  .map(group => group[0])
}

myself.textSorter = "Returns a function specialized for sorting arrays of text. Accepts a parameter for what to sort on that can be: undefined/null (identity), a string/symbol (for key lookup), a function (that returns the value to sort on), or an array of any mix of the three (for breaking ties). Handles mixed-case text sensibly but otherwise no smarter than the default sort order (i.e. numbers are still sorted in cuckoo-town)." 
const textSorter = (sortOn, reversed = false) => {
  const sorters = [].concat(sortOn)
  const [ifLess, ifMore] = reversed ? [1, -1] : [-1, 1]
  const resolve = (a, b, sorter) => {
    switch (typeof sorter) {
      case 'function':
        ;[ a, b ] = [ sorter(a), sorter(b) ]
        break
      case 'string':
      case 'symbol':
        ;[ a, b ] = [ a[sorter], b[sorter] ]
        break
      case 'undefined':
      case 'object':
        // identity
        if (sorter == null) break
      default:
        throw new Error(`Unexpected type '${typeof sorter}' for sorter parameter`)
    }
    // TODO: modify so passing Number as the sorter makes numbers sort correctly
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
const arrayOf = (length, item) => Array.from({ length }, (_, i) => {
  if (typeof item === 'function') return item(i)
  else if (typeof item === 'object') return structuredClone(item)
  else return item
})
myself.stringOf = "arrayOf but for Strings."
const stringOf = (n, snippet = ' ', joinWith = '') => {
  return String(joinWith) === '' ?
      String(snippet).repeat(n)
    : arrayOf(n, String(snippet)).join(joinWith)
}

myself.swap = "Swaps two elements of an Array (in-place)."
const swap = (arr, i, j) => {
  // Source: <https://stackoverflow.com/questions/872310/swap-array-elements-in-javascript>
  ;[ arr[i], arr[j] ] = [ arr[j], arr[i] ]
  // arr[i] = arr.splice(j, 1, arr[i])[0]
  return arr
}

myself.last = "Writing 'someArray[someArray.length - 1]' is juuuuust tedious enough that I think this is worth it."
const last = (array, nth = 1) => array[array.length - nth]

myself.flattener = "Flattens the given array to the specified depth. Depth must be finite, as there are no checks for circular references." // <- TODO?
const flattener = (array, depth = 1) => {
  if (!array.length) return array
  for (const _ of range(depth)) {
    if (!array.some(value => Array.isArray(value))) {
      return array
    }
    array = array.reduce(flatten)
  }
  return array
}

myself.flatten = "Concatenates two items that may or may not be arrays, using push instead of concat for speed. For use as an argument to Array.prototype.reduce"
const flatten = (flattened, bump, i) => {
  if (!Array.isArray(flattened)) flattened = [flattened]
  else if (i === 1) {
    // If we're not given an initial value, 'flattened' will be an element of
    // the array being reduced, which we want to avoid mutating, but if we copy
    // on every iteration we lose the speedup gained from using push. We take
    // the first iteration to be i === 1, not 0, because i only equals 0 when
    // an initial value *is* provided.
    flattened = [...flattened]
  }
  if (Array.isArray(bump)) flattened.push(...bump)
  else flattened.push(bump)
  return flattened
}

myself.iterEquals = "Tests two iterables to see if they are equal. Takes an optional parameter to ignore ordering."
// Modified from <https://www.freecodecamp.org/news/how-to-compare-arrays-in-javascript/>
const iterEquals = (a, b, ordered = true) => {
  if (a == null || b == null) return a == b
  a = [...a]
  b = [...b]
  if (a.length !== b.length) return false
  if (!ordered) {
    a.sort()
    b.sort()
  }
  return a.every((value, index) => value === b[index])
}
// TODO: document, export
const iterOr = (a, b) => {
  if (a == null || iterEquals(a, b, false)) return []
  if (b == null) return [ ...a ]

  b = new Set(b)
  const diffs = new Set()
  for (const value of a) {
    if (!b.has(value)) diffs.add(value)
  }
  return [...diffs]
}
const iterXor = (a, b) => findUniques([...a].concat(...b))

myself.multilineRegex = "Create a RegEx that spans multiple lines (so it can be commented)."
// Source: <https://www.dormant.ninja/multiline-regex-in-javascript-with-comments/>
const multilineRegex = (parts, flags = '') =>
  new RegExp(parts.map(x => (x instanceof RegExp) ? x.source : x).join(''), flags)

myself.backToWork = backToWork

module.exports = {
  docs: () => print(myself),
  range,
  zip,
  ifFunc,
  isTruthy,
  print,
  isEmpty,
  makeGroups,
  deDup,
  findDupes,
  findUniques,
  textSorter,
  arrayOf,
  stringOf,
  swap,
  last,
  flattener,
  flatten,
  iterEquals,
  multilineRegex,
  backToWork,
} // = require('./general')

// for organization (future):
// module.exports = {
  // ...textStuff,
  // ...arrayStuff,
  // other,
  // miscellaneous,
  // functions,
// }
