// TODO: pull some of these functions out into new submodule--perhaps
// something to do with iterables?
// "collections" or "iters"

const myself = {} // documentation
const { max, min, flatten, sum, product, reduceify } = require('./reducers')

const backToWork = require('./BACK TO WORK')

myself.len = "Python-style function for getting the length of an iterable in a null-safe way, because I'm tired of writing `!arr?.length` over and over."
const len = (thing) => {
  if (thing == null || !isIterable(thing)) return 0
  return Array.isArray(thing) ? thing.length : [...thing].length
}

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
    start = typeof step === 'bigint' ? 0n : 0
  }
  if (start < stop && step <= 0) return
  if (start > stop && step >= 0) return
  for (let i = start; (start < stop ? i < stop : i > stop); i += step) {
    yield i
  }
}

myself.zip = "Python-style zip function: combines a list of arrays into a list of pairs/triplets/etc. Takes an optional parameter for padding the results when the input arrays are different lengths; if none is provided, the output will be the length of the shortest input array."
const zip = (arrays, ...padding) => {
  const padResults = Boolean(padding.length)
  padding = padding[0]
  
  const zipped = []
  if (!len(arrays)) return zipped

  const zippedLen = arrays
    .map(array => array.length)
    .reduce(padResults ? max : min)
  for (const i of range(zippedLen)) {
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

myself.pluralize = "Returns the plural version of the given word if the given number is more or less than 1. Makes a token attempt to be grammatical, but no guarantees."
const pluralize = (word, n = 2) => {
  if (Math.abs(n) === 1 || !word.length) return word
  const lower = word.toLowerCase()
  if (lower.endsWith('ife')) return word.slice(0, -2) + 'ves'
  if (lower.length > 1 && lower.endsWith('y')) return word.slice(0, -1) + 'ies'
  if (/(?:s|x|ch|sh)$/.test(lower)) return word + 'es'
  if (/(?:ar|a|l)f$/.test(lower)) return word.slice(0, -1) + 'ves'
  return word + 's'
}

myself.logVar = "A debugging function that logs the name, location, and value of a variable (or variables) in a structured way."
const logVar = (...variables) => {
  const defaultName = '<anonymous>'
  const defaultLoc = new Error().stack.split('\n').slice(2).join('\n')
  for (const [value, name = defaultName, loc = defaultLoc] of variables) {
    console.log('=*='.repeat(20))
    console.log(`value of '${name}' at:`)
    console.log(loc)
    console.log('-*-'.repeat(20))
    console.dir(value)
  }
  console.log('=*='.repeat(20))
}

myself.ifFunc = "Pure-ish 'if' function with short-circuiting. Just because. (Only 'ish' because, without the side effect of assignment, the return value of the executed branch would be lost, making the function useless unless the branches themselves had side effects.)"
const ifFunc = (condition, onTrue, onFalse = () => {}) => {
  const forceTrue = (thingy) => thingy || true
  let result
  ;( condition && forceTrue(result = onTrue()) ) || ( result = onFalse() )
  return result
}

// TODO: document
const boolReduce = (params, func, ...initialValue) => {
  let unbroken = true
  params.reduce((a, b) => {
      unbroken = unbroken && func(a, b)
      return b
    },
    ...initialValue
  )
  return unbroken
}

myself.op = "Turn JavaScript's native operators into proper functions."
const op = (opType) => opFuncs[opType] ?? opFuncs.err(
  `Unsupported or invalid operator '${opType}'`, TypeError
)
const parityError = (opType, n = 2) => {
  throw new TypeError(
    `Operator '${opType}' requires at least ${n} ${pluralize('argument', n)}`
  )
}
const opFuncs = {
  // non-chaining operators
  err: (message, errType = Error) => (() => { throw new errType(message) })(),
  // choose can short-circuit if you pass functions and call the result:
  // `op('choose')(isSpam(x), () => doSpamThing(x), () => doEggsThing(x))()`
  choose: (cond, ifTrue, ifFalse) => cond ? ifTrue : ifFalse,
  loop: (cond, exec, params = []) => {
    let result
    while (cond) {
      [cond, result] = exec(...params)
    }
    return result
  },
  iter: (exec, iterable) => {
    let result
    for (const i of iterable) {
      result = exec(i)
    }
    return result
  },
  match: ({
    test,
    tasks = [],
    defaultTask,
    matchAll = true,
    fallthrough = false
  }) => {
    let none = true
    let fellthrough = false
    let result
    for (const {
      tests,
      task,
      params = [],
      me = this
    } of tasks) {
      if (tests.includes(test) || fellthrough) {
        none = false
        fellthrough = fallthrough && true
        result = task.apply(me, params)
        if (!matchAll) break
      }
    }
    if (none && defaultTask != null) {
      const { task, params = [], me = this } = defaultTask
      result = task.apply(me, params)
    }
    return result
  },
  // chaining operators
  add: (...params) => params.reduce(sum, 0),
  sub: (...params) => {
    if (params.length === 1) return -params[0]
    return params
      .map((n, i) => i === 0 ? n : -n)
      .reduce(sum, 0)
  },
  mult: (...params) => params.reduce(product, 1),
  div: (...params) => {
    if (params.length === 1) return 1 / params[0]
    return params
      .map((n, i) => i === 0 ? n : 1 / n)
      .reduce(product, 1)
  },
  pow: (...params) => params.reduce((a, b) => a ** b),
  lt: (...params) => {
    if (params.length <= 1) return parityError('lt')
    return boolReduce(params, (a, b) => (a < b), -Infinity)
  },
  lte: (...params) => {
    if (params.length <= 1) return parityError('lte')
    return boolReduce(params, (a, b) => (a <= b), -Infinity)
  },
  gt: (...params) => {
    if (params.length <= 1) return parityError('gt')
    return boolReduce(params, (a, b) => (a > b), Infinity)
  },
  gte: (...params) => {
    if (params.length <= 1) return parityError('gte')
    return boolReduce(params, (a, b) => (a >= b), Infinity)
  },
  eq: (...params) => {
    if (params.length < 1) return parityError('eq', 1)
    return boolReduce(params, (a, b) => a === b, params[0])
  },
  // short-circuiting operators
  pairwiseComp: (paramIter, comp = (a, b) => a === b) => {
    let none = true
    let one = true
    let prev
    for (const param of paramIter) {
      if (none) {
        none = false
        prev = param
        continue
      }
      one = false
      if (!comp(prev, param)) return false
      prev = param
    }
    if (one || none) return parityError('pairwiseComp')
    return true
  },
  any: (paramIter, test = (a) => !!a) => {
    for (const param of paramIter) {
      if (test(param)) return true
    }
    return false
  },
  all: (paramIter, test = (a) => !!a) => {
    for (const param of paramIter) {
      if (!test(param)) return false
    }
    return true
  },
  // short-circuiting versions of lt, etc.?
  // (no short-circuiting version of choose needed; see comment above)
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

myself.isEmpty = "Determines whether a value counts as 'something' or 'nothing'. Used in objects.merge. By default, 0 and NaN are *not* considered empty. (Defaults can be overridden by supplying an array of exceptions.)"
const isEmpty = (
  value,
  { alwaysEmpty = [], neverEmpty = [ 0, 0n, NaN ] } = {}
) => {
  if (alwaysEmpty.includes(value)) return true
  if (neverEmpty.includes(value)) return false
  
  if (value == null) return true
  if (typeof value === 'boolean') return false
  if (typeof value === 'function') {
    // this will probably never be useful, but it was a fun regex exercise
    const arrowRegex = multilineRegex([
      /^\(\)=>({;*)?/,               // () => [ { [ ; ] ]
      /(return)?(undefined)?;*}?$/   // [ return ][ undefined ][ ; ][ } ]
    ])
    const funcRegex = multilineRegex([
      /^function([\w]*)\(\){/,       // function [ name ] () {
      /;*(return(undefined)?;*)?/,   // [ ; ][ return [ undefined ][ ; ] ]
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

myself.arrayify = "Copies iterables into a new array; non-iterables result in an empty array. For when you want to ensure Array properties like length, reduce, slice, etc. are available. (If you want non-iterables to also be copied instead of ignored, you should probably use `[].concat(thing)` instead.)"
const arrayify = (thing) => isIterable(thing) ? [...thing] : []

myself.memoize = "Wraps a (possibly expensive) function in a closure that memoizes its return value. NOTE: if the original function is recursive, it must be saved to the same variable (`someFunc = memoize(someFunc)`) or wrapped in a closure first to be memoized properly."
// TODO: fix 'new name must be old name' thing...somehow?
const memoize = (func) => {
  const cache = new MultiMap()
  return new Proxy(func, {
    apply(target, thisArg, argumentsList) {
      const { hasKey, value } = cache.search(argumentsList)
      if (hasKey) return value 
      const result = Reflect.apply(target, thisArg, argumentsList)
      cache.set(argumentsList, result)
      return result
    }
  })
}
const MultiMap = class extends Map {
  #leafKey
  constructor (...params) {
    super(...params)
    this.#leafKey = Symbol()
  }

  #traverse (argumentsList, mutating = false, value) {
    const single = !argumentsList.length
    const first = single ? argumentsList : argumentsList[0]
    let hasKey = super.has(first)
    let oldValue = super.get(first)
    if (single) {
      if (mutating) super.set(first, value)
      return { hasKey, value: oldValue }
    }

    if (!hasKey) super.set(first, new Map())
    let innerMap = super.get(first)
    for (const key of argumentsList.slice(1)) {
      if (!innerMap.has(key)) {
        innerMap.set(key, new Map())
      }
      innerMap = innerMap.get(key)
    }
    hasKey = innerMap.has(this.#leafKey)
    oldValue = innerMap.get(this.#leafKey)
    if (mutating) innerMap.set(this.#leafKey, value)
    return { hasKey, value: oldValue }
  }

  search (args) {
    return this.#traverse(args)
  }

  has (args) {
    return this.#traverse(args).hasKey
  }

  get (args) {
    return this.#traverse(args).value
  }

  set (args, value) {
    return this.#traverse(args, true, value)
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
  // NB: I chose `descending = false` instead of the more natural `ascending
  // = true` so it can be called as e.g. `getSorter(sortThing, 'descending')`

  // In addition to a saner sort order, this function has a secondary goal of
  // sorting arbitrary permutations *unambiguously.* That is, for any given
  // Array arr, `shuffle(arr).sort(getSorter())` should result in the same
  // permutation every time it's called (this may or may not be possible).
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
    if (a === null) return b === undefined ? [ 0, 1 ] : [ 1, 0 ]
    if (b === null) return a === undefined ? [ 1, 0 ] : [ 0, 1 ]

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
  // // premature optimization: traverses each iterable at most once for 
  // // ordered tests and twice for unordered, instead of traversing `a` 2/4 
  // // times as in the above methods
  // a = ordered ? [...a] : makeGroups(a)
  // let i = 0
  // for (const val of b) {
  //   if (ordered) {
  //     if (a[i] !== val) return false
  //   }
  //   else {
  //     if (!a.has(val)) return false
  //     let aGroup = a.get(val)
  //     if (aGroup.length === 0) return false
  //     aGroup.pop()
  //   }
  //   i += 1
  // }
  // const sizeMatch = ordered ? i === a.length : i === a.size
  // if (!sizeMatch || ordered) return !!sizeMatch
  // for (const [ key, group ] of a) {
  //   if (group.length !== 0) return false
  // }
  // return true     
}

// TODO: document, export
// <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#set_composition>
const compareItersBy = (type) => (a, b) => [...new Set(a)[type](new Set(b))]
const getIter = {
  diff: compareItersBy('difference'),
  intersection: compareItersBy('intersection'),
  union: compareItersBy('union'),
  biDiff: compareItersBy('symmetricDifference'),
}

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
  pluralize,
  logVar,
  ifFunc,
  boolReduce,
  parityError,
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
  getIter,
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
