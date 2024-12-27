const myself = {} // documentation

const backToWork = require('./BACK TO WORK')

myself.range = "Python-style range function. Generator."
// Alternate version (source: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#sequence_generator_range>)
// const range = (start, stop, step = 1) =>
//   Array.from({ length: (stop - start) / step }, (_, i) => start + i * step)
// Using Array.from is simpler, but a generator uses no heap space, so it can
// accomodate very large (or even infinite!) ranges.
const range = function* (start = 0, stop, step = 1) {
  if (typeof start !== typeof step) {
    start = BigInt(start)
    step = BigInt(step)
  }
  if (stop === undefined) {
    stop = start
    start = (start - start)
  }
  if (start < stop && step <= 0) return
  if (start > stop && step >= 0) return
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
      let val = i >= array.length ? padWith : array[i]
      group.push(val)
    }
    zipped.push(group)
  }
  return zipped
}

myself.print = "console.dir optimized for the Node.js REPL."
const print = (obj, depth = null, repl = true) => {
  console.dir(obj, { depth })
  return repl ? undefined : obj
}

myself.ifFunc = "Pure-ish 'if' function with short-circuiting. Just because. (Only 'ish' because, without the side effect of assignment, the return value of the executed branch would be lost, making the construct useless unless the branches themselves had side effects.)"
const ifFunc = (condition, onTrue, onFalse = () => {}) => {
  const forceTrue = (thingy) => thingy || true
  let result
  ;( condition && forceTrue(result = onTrue()) ) || ( result = onFalse() )
  return result
}

myself.isTruthy = "Javascript's truthiness rules are obnoxious and I always second-guess myself when trying to remember them."
const isTruthy = (thing) => thing ? 'yes' : 'no'

myself.isIterable = "A more concise test for iterability."
const isIterable = (thing) => typeof thing?.[Symbol.iterator] === 'function'

myself.isEmpty = "Determines whether a value counts as 'something' or 'nothing'. Used in objects.merge."
const isEmpty = (value, alwaysEmpty = [], neverEmpty = []) => {
  if (alwaysEmpty.includes(value)) return true
  if (neverEmpty.includes(value)) return false
  
  if (value == null) return true
  if (typeof value === 'boolean') return false
  if (value.length != null) return value.length === 0
  if (value.size != null) return value.size === 0
  if (isIterable(value)) {
    for (const _ of value) return false
    return true
  }
  if (typeof value === 'function') {
    // this will probably never be useful, but it was a fun regex exercise
    return multilineRegex([
      /^(function([\w-]*))?\(\)(=>)?{/, // [function[ name]] () [=>] {
      /;*(return(undefined)?;*)?/,       // [;][return [undefined][;]]
      /}$/                               // }
    ]).test(value.toString().replaceAll(/\s/g, ''))
  }
  if (typeof value === 'object' && Object.keys(value).length === 0) return true
  // TODO: anything else to test?
  return !value
}

myself.iterify = "Wraps the given parameter in an array, unless it's already iterable. More terse than `if(!isIterable(thing)) thing = [thing]`; less obtuse/more general than `thing = [].concat(thing)`."
const iterify = (thing) => isIterable(thing) ? thing : [thing]

"Helper object for memoize"
const MultiCache = function () {
  this.cache = new Map()
  this.leafKey = Symbol()
}
MultiCache.prototype.cacheIt = function (params, wrappedFunc) {
  const getOrSet = (map, key, func) => {
    if (!map.has(key)) {
      map.set(key, func(...params))
    }
    return map.get(key)
  }
  if (!Array.isArray(params)) params = [params]
  let nestedCache = this.cache
  for (const key of params) {
    nestedCache = getOrSet(nestedCache, key, () => new Map())
  }
  return getOrSet(nestedCache, this.leafKey, wrappedFunc)
}

myself.memoize = "Wraps a (possibly expensive) function in a closure that memoizes its return value."
const memoize = (func) => {
  const multiCache = new MultiCache()
  return (...params) => multiCache.cacheIt(params, func)
}

myself.timeIt = "Executes the given function with the given parameters and times how long it takes to finish. Returns an object containing the return value of the function and the time taken, in milliseconds."
const timeIt = (func, params = [], self = this, silent = false) => {
  const start = Date.now()
  const result = func.apply(self, params)
  const time = Date.now() - start
  if (!silent) console.log(`Time taken: ${time / 1_000} seconds`)
  return {
    result,
    time,
  }
}

"Not exported or used, just here as a reminder."
const mapToObject = (someMap) => Object.fromEntries(someMap.entries())

myself.makeGroups = "Sorts an iterable into caller-determined 'buckets' (default: identity). Returns a Map by default, or an Object for when the 'bucket' names can safely be coerced to strings. (Yet another function I worked super hard on that's already in the spec, lol)"
// <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy>
// <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy>
const makeGroups = (iterable, idFunc = (item) => item, strong = true) => {
  return strong ?
      Map.groupBy(iterable, idFunc)
    : Object.groupBy(iterable, idFunc)
}
myself.deDup = "Removes duplicates. Caller determines what counts as a dupe, and which duplicate to keep (default: first). Uses Map.groupBy but returns an Array. If you're using identity to determine dupes, you should probably just do `[...new Set(iterable)]` instead."
const deDup = (
  iterable, 
  identifier, 
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
  .flat()
}

myself.getSorter = "Returns a sorting function that behaves more sanely than the default (specifically: mixed-case text, text with diacritics, and numbers sort the way you would expect; Objects are sorted with util.inspect; and mixed-type arrays are sorted by type first, then value). Accepts a parameter for what to sort on that can be: undefined/null (identity), a string/symbol (for key lookup), a function (that returns the value to sort on), or an array of any mix of the three (for breaking ties)."
const getSorter = (sortOn, reversed = false) => {
  // In addition to a saner sort order, this function has a secondary goal of
  // sorting arbitrary permutations *unambiguously.* That is, for any given
  // Array arr, `shuffle(arr).sort(getSorter())` should always result in a
  // permutation indistinguishable from `arr.sort(getSorter())` (this may or
  // may not be possible).
  const sorters = iterify(sortOn)
  const [ifLess, ifMore] = reversed ? [1, -1] : [-1, 1]
  
  const resolve = (aObj, bObj, sorter) => {
    switch (typeof sorter) {
      case 'function':
        return [ sorter(aObj), sorter(bObj) ]
      case 'string':
      case 'symbol':
        return [ aObj[sorter], bObj[sorter] ]
      case 'undefined':
      case 'object':
        if (sorter == null) return [ aObj, bObj ]
      default:
        throw new Error(`Unexpected type '${typeof sorter}' for sorter parameter`)
    }
  }
  
  const makeComparable = (aObj, bObj, sortBy) => {
    let [ a, b ] = resolve(aObj, bObj, sortBy)
    if (a === b) return [ a, b ]
    const [ aType, bType ] = [ typeof a, typeof b ]
    if (aType !== bType) return [ aType, bType ]
    if (['number', 'bigint'].includes(aType)) return [ a, b ]
    
    if (aType === 'object' && a !== null) {
      return [
        util.inspect(a, { depth: null }),
        util.inspect(b, { depth: null })
      ]
    }
    else {
      const localeCompare = String(a).localeCompare(String(b))
      return [ localeCompare, -localeCompare ]
    }
  }

  return (aObj, bObj) => {
    for (const tiebreak of sorters) {
      const [a, b] = makeComparable(aObj, bObj, tiebreak)
      if (a !== b) {
        return a < b ? ifLess : ifMore
      }
    }
    return 0
  }
}

myself.arrayOf = "Returns 'length' copies of 'item' (which can be a generator function). If 'item' is a primitive, this is equivalent to `Array(length).fill(item)`"
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

myself.last = "Writing 'someArray[someArray.length - 1]' is juuuuust tedious enough that I think this is worth it (I wrote this before I learned about Array.prototype.at)"
const last = (array, nth = 1) => array[array.length - nth]

myself.flattener = "Flattens the given array to the specified depth. Depth must be finite, as there are no checks for circular references. (Whoops, this is already in the JS standard...)"
// <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat>
// <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap>

// Unsurprisingly, this function is slower than the built-in method. However, 
// because it operates in a flat loop instead of using recursion, it can handle
// much larger depths! On the other hand, due to its use of reduce it's limited
// to shorter arrays. So, it's superior to the built-in only when flattening an 
// array nested thousands of layers deep, but containing only a handful 
// (hundreds?) of elements per layer. (Y'know, just in case that ever comes up.)
// (I wonder if I could get the best of both worlds by combining a plain loop 
// with a call to Array.prototype.flat?)
const flattener = (array, depth = 1) => {
  if (!['number', 'bigint'].includes(typeof depth) || depth === Infinity) {
    throw new RangeError('Depth must be finite')
  }
  if (!array.length) return array
  for (const _ of range(depth)) {
    if (array.some(value => Array.isArray(value))) {
      array = array.reduce(flatten)
    }
    else break
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
// Generalized from <https://www.freecodecamp.org/news/how-to-compare-arrays-in-javascript/>
const iterEquals = (a, b, ordered = true, strictNullables = false) => {
  if (a == null || b == null) return strictNullables ? a === b : a == b
  if (ordered) {
    a = [...a]
    b = [...b]
    return (
      a.length === b.length &&
      a.every((value, index) => value === b[index])
    )
  }
  else {
    a = makeGroups(a)
    b = makeGroups(b)
    return (a.size === b.size) && [...a.entries()].every(
        ( [key, aGroup] ) => b.has(key) && b.get(key).length === aGroup.length
      )
  }
}

// TODO?: document, export
// Alternative: just use Set composition methods
// e.g. `[...new Set(a).difference(new Set(b))]`
// <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#set_composition>
const iterOr = (a, b) => {
  if (a == null || iterEquals(a, b, false)) return []
  if (b == null) return [...a]

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

// TODO: new array/iterable submodule
// array object { swap, last, etc. } *and* iterable submodule?
module.exports = {
  docs: () => print(myself),
  range,
  zip,
  print,
  ifFunc,
  isTruthy,
  isIterable,
  isEmpty,
  iterify,
  memoize,
  timeIt,
  makeGroups,
  deDup,
  findDupes,
  findUniques,
  getSorter,
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

// for organization? (future):
// module.exports = {
  // ...textStuff,
  // ...arrayStuff,
  // other,
  // miscellaneous,
  // functions,
// }
