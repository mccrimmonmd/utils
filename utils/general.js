const myself = {} // documentation
const { max, min, flatten } = require('./reducers')

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

myself.zip = "Python-style zip function: combines a list of arrays into a list of pairs/triplets/etc. Takes an optional parameter for padding the results when the input arrays are different lengths; if none is provided, the output will be the length of the shortest input array."
const zip = (arrays, ...padding) => {
  const padResults = padding.length
  padding = padding[0]
  
  const zipped = []
  if (!arrays?.length) return zipped

  const len = arrays
    .map(array => array.length)
    .reduce(padResults ? max : min)
  for (const i of range(len)) {
    let group = []
    for (const array of arrays) {
      let val = i < array.length ? array[i] : padding
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

myself.ifFunc = "Pure-ish 'if' function with short-circuiting. Just because. (Only 'ish' because, without the side effect of assignment, the return value of the executed branch would be lost, making the function useless unless the branches themselves had side effects.)"
const ifFunc = (condition, onTrue, onFalse = () => {}) => {
  const forceTrue = (thingy) => thingy || true
  let result
  ;( condition && forceTrue(result = onTrue()) ) || ( result = onFalse() )
  return result
}

myself.op = "Turn JavaScript's native operators into proper functions."
// const op = (a, opType, b) => {
// const op = (opType, ...rest) => {
const op = (opType) => {
  switch (opType) {
    case 'choose':
      return opFuncs.choose
    case 'loop':
      return opFuncs.loop
    case 'iter':
      return opFuncs.iter
    case 'match':
      return opFuncs.match
    default:
      return binOp(opType)
  }
}
const binOp = (opType) => {
  switch (opType) {
    case '+':
      return (...params) => params.reduce(sum, 0)
      // return (a, b) => a + b
    case '-':
      return (...params) => {
        if (params.length === 1) return -params[0]
        for (const i of Object.keys(params.slice(1))) params[i] = -params[i]
        return params.reduce(sum, 0)
      }
      // return (a, b) => a - b
    case '*':
      return (...params) => params.reduce(product, 1)
      // return (a, b) => a * b
    case '/':
      return (...params) => {
        if (params.length === 1) return 1 / params[0]
        for (const i of Object.keys(params.slice(1))) params[i] = 1 / params[i]
        return params.reduce(product, 1)
      }
      // return (a, b) => a / b
    case 'pow':
      return (a, b) => a ** b
    case 'or':
      return (a, b) => a || b
    case 'and':
      return (a, b) => a && b
    case 'lt':
      return (a, b) => a < b
    case 'lte':
      return (a, b) => a <= b
    case 'gt':
      return (a, b) => a > b
    case 'gte':
      return (a, b) => a >= b
    case 'eq':
      return (a, b) => a === b
    default:
      throw new TypeError(`Unsupported or invalid operator '${opType}'`)
  }
}
const opFuncs = {
  choose: (cond, ifTrue, ifFalse) => cond ? ifTrue : ifFalse,
  loop: (cond, exec, params) => {
    let result
    while (cond) {
      [cond, result] = exec(...params)
    }
    return result
  },
  iter: (exec, arr) => {
    let result
    for (const i of arr) {
      result = exec(i)
    }
    return result
  },
  match: (testAgainst, ...tasks) => {
    // TODO: can this support a default case?
    let result
    for (const {
      tests,
      task,
      params = [],
      me = this,
      stop = false
    } of tasks) {
      if (tests.includes(testAgainst)) {
        result = task.apply(me, params)
        if (stop) break
      }
    }
    return result
  }
}

myself.TypeCheckedArray = "An Array which can only contain values that are all the same type. Was supposed to be an exercise in inheritance, but ended up mostly being about Proxies instead."
const TypeCheckedArray = class extends Array {
  #type
  constructor(type, ...params) {
    super(...params)
    this.#type = type
    return new Proxy(this, {
      set: (target, prop, value) => {
        if (typeof value !== this.#type && prop !== 'length') return false
        return Reflect.set(target, prop, value)
      }
    })
  }
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
  if (typeof value === 'function') {
    // this will probably never be useful, but it was a fun regex exercise
    const arrowRegex = multilineRegex([
      /^\(\)=>({;*)?/,               // () => [{[;]]
      /(return)?(undefined)?;*}?$/   // [return][undefined][;][}]
    ])
    const funcRegex = multilineRegex([
      /^function([\w]*)\(\){/,       // function[ name] () {
      /;*(return(undefined)?;*)?/,   // [;][return [undefined][;]]
      /}$/                           // }
    ])
    const valueString = value.toString().replaceAll(/\s/g, '')
    return arrowRegex.test(valueString) || funcRegex.test(valueString)
  }
  if (value.length != null) return value.length === 0
  if (value.size != null) return value.size === 0
  if (isIterable(value)) {
    for (const _ of value) return false
    return true
  }
  if (typeof value === 'object' && Object.keys(value).length === 0) return true
  // TODO: anything else to test?
  return !value
}

myself.iterify = "Wraps the given parameter in an array, unless it's already iterable. (In case you want to preserve the original type and/or avoid making a copy--otherwise, `[].concat(thing)` is probably a better choice.)"
const iterify = (thing) => isIterable(thing) ? thing : [thing]

myself.arrayify = "Converts iterables into arrays; non-iterables result in an empty array. For when you want to ensure Array methods and properties like length, reduce, slice, etc. are available. (If you want non-iterables to also be converted instead of ignored, you should probably use `[].concat(thing)` instead.)"
const arrayify = (thing) => isIterable(thing) ? [...thing] : []

myself.memoize = "Wraps a (possibly expensive) function in a closure that memoizes its return value."
// TODO: doesn't handle recursion -- how to fix? Proxy, maybe?
const memoize = (func) => {
  const multiCache = new MultiCache()
  return (...params) => multiCache.cache(params, func)
}
const MultiCache = class {
  constructor () {
    this.nestedCache = new Map()
    this.simpleCache = new Map()
    this.leafKey = Symbol()
  }

  cache (params, wrappedFunc) {
    const getOrSet = (map, key, func) => {
      if (!map.has(key)) {
        map.set(key, func(...params))
      }
      return map.get(key)
    }
    if (params.length <= 1) {
      return getOrSet(this.simpleCache, params?.[0], wrappedFunc)
    }
    else {
      let innerCache = this.nestedCache
      for (const key of params) {
        innerCache = getOrSet(innerCache, key, () => new Map())
      }
      return getOrSet(innerCache, this.leafKey, wrappedFunc)
    }
  }
}

myself.timeIt = "Executes the given function with the given parameters and times how long it takes to finish. Returns an object containing the return value of the function and the time taken, in milliseconds."
const timeIt = (
  func,
  {
    params = [],
    silent = false,
    me = this,
  } = {}
) => {
  const start = Date.now()
  const result = func.apply(me, params)
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
const findDupes = (iterable, identifier) => {
  return [...makeGroups(iterable, identifier).values()]
    .filter(group => group.length > 1)
}
myself.findUniques = "The complement of deDup's complement."
const findUniques = (iterable, identifier) => {
  return [...makeGroups(iterable, identifier).values()]
    .filter(group => group.length === 1)
    .flat()
}

myself.getSorter = "Returns a sorting function that behaves more sanely than the default (specifically: mixed-case text, text with diacritics, and numbers sort the way you would expect; Objects are sorted with util.inspect; and mixed-type arrays are sorted by type first, then value). Accepts a parameter for what to sort on that can be: undefined/null (identity), a string/symbol (for key lookup), a function (that returns the value to sort on), or an array of any mix of the three (for breaking ties)."
const getSorter = (sortOn, descending = false) => {
  // In addition to a saner sort order, this function has a secondary goal of
  // sorting arbitrary permutations *unambiguously.* That is, for any given
  // Array arr, `shuffle(arr).sort(getSorter())` should always result in a
  // permutation indistinguishable from `arr.sort(getSorter())` (this may or
  // may not be possible).
  const sorters = iterify(sortOn)
  const [ifLess, ifMore] = descending ? [1, -1] : [-1, 1]
  
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

    // sort null to the end of the list, just before undefined
    if (a == null) return b === undefined ? [ 0, 1 ] : [ 1, 0 ]
    if (b == null) return a === undefined ? [ 1, 0 ] : [ 0, 1 ]

    const [ aType, bType ] = [ typeof a, typeof b ]
    if (aType !== bType) return [ aType, bType ]
    if (['number', 'bigint'].includes(aType)) return [ a, b ]
    
    if (aType === 'object') {
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

myself.arrayOf = "Returns 'length' copies of 'item' (which can be a generator function). If 'item' is copy-by-value (e.g. a primitive), this is equivalent to `Array(length).fill(item)`"
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

myself.iterEquals = "Tests two iterables to see if they are equal. Takes an optional parameter to ignore ordering."
// Generalized from <https://www.freecodecamp.org/news/how-to-compare-arrays-in-javascript/>
const iterEquals = (a, b, ordered = true) => {
  if (ordered) {
    a = [...a]
    b = [...b]
    return (
      a.length === b.length
      && a.every((value, index) => value === b[index])
    )
  }
  else {
    a = makeGroups(a)
    b = makeGroups(b)
    return (a.size === b.size) && [...a.entries()].every(
        ([key, aGroup]) => b.has(key) && b.get(key).length === aGroup.length
      )
  }
}

// TODO: document, export
// <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#set_composition>
const compTypes = ['difference', 'intersection', 'union', 'symmetricDifference']
const compareItersBy = (type) => (a, b) => [...new Set(a)[type](new Set(b))]

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
  op,
  TypeCheckedArray,
  isTruthy,
  isIterable,
  isEmpty,
  iterify,
  arrayify,
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
  flattener,
  iterEquals,
  compareItersBy,
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
