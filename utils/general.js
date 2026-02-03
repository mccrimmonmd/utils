// TODO: pull some of these functions out into new submodule "iterable"
const myself = {
  aboutMe: "General 'utils' documentation goes here."
}
const { max, min, flatten } = require('./reducers')
// const { range, entries, isIterable, ensureIterable } = require('./iterable') // for re-export

const backToWork = require('./BACK TO WORK')
myself.backToWork = backToWork

myself.len = "Python-style function for getting the length of an iterable in a null- and type-safe way (because I'm tired of writing `!arr?.length` over and over)."
const len = (thing) => {
  if (thing == null || !isIterable(thing)) return 0
  return Array.isArray(thing) ? thing.length : [...thing].length
}

myself.range = "Python-style range function (generator)."
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
  const [ padResults, padding ] = [ padding.length !== 0, padding[0] ]
  
  const zipped = []
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

// TODO
const zipIter = function* (iters, ...padding) {
  // determine stopping criterion
  // get the first element of every iterable
  // if necessary, add padding if an iterable is empty
  // yield the elements as an array
  // repeat until the criterion is met
}

myself.defaultOrAny = "For when you want default argument(s) that can be any type, including undefined. The first paramater can be a single default or an array of defaults, but the second paramater must be an array."
const defaultOrAny = (defaultValues, wrappedValues) => {
  if (!Array.isArray(wrappedValues)) {
    console.log(`defaultOrAny usage:
  function yourFunctionDefinition (requiredParam, ...oneOrMoreOptionalParams) {
    var [ arg1, ... ] = defaultOrAny(oneOrMoreDefaults, oneOrMoreOptionalParams)
    ...
  }`)
    throw new TypeError("Second argument to 'defaultOrAny' must be an array")
  }
  defaultValues = ensureIterable(defaultValues)
  const results = []
  const empty = Symbol()
  for (const [def, val] of zip([defaultValues, wrappedValues], empty)) {
    if (val === empty) results.push(def)
    else results.push(val)
  }
  return results
}

myself.entries = "A generic version of Array.prototype.entries that works with any iterable."
const entries = function* (iterable) {
  if (typeof iterable.entries === 'function') yield* iterable.entries()
  let i = 0
  const iterator = iterable[Symbol.iterator]()
  let entry = iterator.next()
  while (!entry.done) {
    yield [i, entry.value]
    i += 1
    entry = iterator.next()
  }
}

myself.print = "console.dir shorthand."
const print = (obj, depth = null) => console.dir(obj, { depth })

myself.printFn = "A functional variant of 'print' that returns the printed object."
const printFn = (obj, depth = null) => {
  ;`
  the main (only?) use-case for printFn is printing and returning something at
  the same time (for e.g. debugging): 'return printFn(thing)'
  ;`
  print(obj, depth)
  return obj
}

myself.printVar = "For logging the name, location, and value of a variable in a structured way."
// TODO?: make functional variant of this, too?
const printVar = (
  value,
  name = '<anonymous>',
  location = new Error().stack.split('\n').slice(2).join('\n'),
) => {
  console.log('=*='.repeat(20))
  console.log(`value of '${name}' at:`)
  console.log(location)
  console.log('-*-'.repeat(20))
  console.dir(value)
  console.log('=*='.repeat(20))
}
myself.printVars = "Uses printVar to log multiple variables."
const printVars = (...variables) => {
  for (const variable of variables) printVar(...ensureIterable(variable))
}

myself.pluralize = "Returns the plural version of the given word if the given number is not 1 or -1. Makes a token attempt to be grammatical, but no guarantees."
const pluralize = (word, n = 2) => {
  if (Math.abs(n) === 1 || !word.length) return word
  if (word.length > 1) {
    const lower = word.toLowerCase()
    if (lower.endsWith('ife')) return word.slice(0, -2) + 'ves'
    if (/[^aeiou]y$/.test(lower)) return word.slice(0, -1) + 'ies'
    if (/(?:ar|a|l)f$/.test(lower)) return word.slice(0, -1) + 'ves'
    if (/(?:s|x|ch|sh)$/.test(lower)) return word + 'es'
  }
  return word + 's'
}

myself.ifFunc = "Pure-ish 'if' function with short-circuiting. Just because. (Only 'ish' because, without the side effect of assignment, the return value of the executed branch would be lost, making the function useless unless the branches themselves had side effects.)"
const ifFunc = (condition, onTrue, onFalse = () => {}) => {
  const forceTrue = (thingy) => thingy || true
  let result
  ;( condition && forceTrue(result = onTrue()) ) || ( result = onFalse() )
  return result
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

// TODO: exception handling should be done with a function, not arrays
// (otherwise, no way to make an exception for e.g. custom collections,
// or objects w/a certain property)
// (wait, no, that's dumb; the caller should just delegate if it's *not*
// one of the exceptions)
myself.isEmpty = "Determines whether a value counts as 'something' or 'nothing'. Used in objects.merge. Empty collections, zero-length iterables, and most falsy values are considered empty; but booleans and numbers (including false, 0, and NaN) are *not* considered empty. Defaults can be overridden by supplying an array of exceptions."
const isEmpty = (
  value,
  {
    alwaysEmpty = [],
    neverEmpty = [],
  } = {}
) => {
  if (alwaysEmpty.includes(value)) return true
  if (neverEmpty.includes(value)) return false
  
  if (value == null) return true
  if (['boolean', 'number', 'bigint'].includes(typeof value)) return false
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

myself.ensureIterable = "Wraps the given parameter in an array, unless it's already iterable."
const ensureIterable = (thing) => isIterable(thing) ? thing : [thing]

myself.ensureArray = "Spreads the given iterable into an array, unless it's already an array. If the parameter is not iterable, it wraps it in a new array before returning it. For when you want to avoid making unnecessary copies and/or you're not sure the parameter will be iterable. (If you know the paramater will either be an array OR a non-iterable, and you don't mind making some copies, `[].concat(thing)` is more concise.)"
const ensureArray = (thing) =>
  Array.isArray(thing) ? thing
  : isIterable(thing) ? [...thing]
  : [thing]

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
  #noArgsKey
  #rootKey
  #leafKey
  constructor (...params) {
    super(...params)
    this.#noArgsKey = Symbol()
    this.#rootKey = Symbol()
    this.#leafKey = Symbol()
  }

  #traverse (argumentsList, ...newValue) {
    const mutating = newValue.length
    const value = mutating && newValue[0]
    const single = argumentsList.length <= 1
    const first =
      single ?
        argumentsList.length ?
          argumentsList[0]
        : this.#noArgsKey
      : this.#rootKey

    let hasKey = super.has(first)
    let oldValue = super.get(first)
    if (single) {
      if (mutating) super.set(first, value)
      return { hasKey, value: oldValue }
    }

    if (!hasKey) super.set(first, new Map())
    let innerMap = super.get(first)
    for (const key of argumentsList) {
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
    return this.#traverse(args, value)
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

myself.dateFilter = "TODO: use with upcoming Temporal object to make utils for searching and filtering dates."
// TODO: parse dates/get 'today' with Temporal instead of moment
// TODO: export all
;`
const inRange = (things, startDate, endDate, dateify = op('id')) => {
  things = [].concat(things)
  dateify = typeof dateify === 'function' ? dateify : (thing) => thing[dateify]
  startDate = moment(startDate)
  endDate = moment(endDate)
  return things.filter(thing => {
    const date = moment(dateify(thing))
    if (!date.isValid()) {
      return false
    }
    return op('lte')(startDate, date, endDate)
  })
}
const daysAway = (things, days, from, dateify = op('id')) => {
  things = [].concat(things)
  from = from == null ? moment() : moment(from)
  dateify = typeof dateify === 'function' ? dateify : (thing) => thing[dateify]
  return things.filter(thing => {
    const date = moment(dateify(thing))
    if (!date.isValid()) {
      return false
    }
    let diff = date.diff(from, 'days')
    if (days >= 0) {
      return diff >= 0 && diff <= days // from ==days_after==>
    }
    else {
      return diff < 0 && diff >= days // <==days_before== from
    }
  })
}
const afterDate = (things, date, dateify) => {
  return daysAway(things, Infinity, date, dateify)
}
const beforeDate = (things, date, dateify) => {
  return daysAway(things, -Infinity, date, dateify)
}
;`

"Not exported or used, just here as a reminder."
const mapToObject = (someMap) => Object.fromEntries(someMap.entries())

const id = (thing) => thing
myself.makeGroups = "Sorts an iterable into caller-determined 'buckets' (default: identity). Returns a Map. (Yet another function I worked super hard on that's already in the spec, lol)"
const makeGroups = (iterable, idFunc = id) => Map.groupBy(iterable, idFunc)

myself.makeWeakGroups = "Same as makeGroups, except it returns an Object instead of a map. For when the 'bucket' names can safely be coerced to strings."
const makeWeakGroups = (iterable, idFunc = id) => Object.groupBy(iterable, idFunc)

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
// TODO: OH NO NaN RUINS EVERYTHING
const getSorter = (sortOn, sortOrder = 'ascending') => {
  // In addition to a saner sort order, this function has a secondary goal of
  // sorting arbitrary permutations *unambiguously.* That is, for any given
  // Array arr, `shuffle(arr).sort(getSorter())` should result in the same
  // permutation every time it's called (this may or may not be possible).
  const descending =
    ['descending', 'desc', '-', false].includes(sortOrder) ||
    (['number', 'bigint'].includes(typeof sortOrder) && sortOrder < 0)
    
  const [ifLess, ifMore] = descending ? [1, -1] : [-1, 1]
  const sorters = ensureIterable(sortOn)
  
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

    // null's default sort order is especially dumb -- I opted to 
    // change it to 'null > everything except undefined'.
    // You could also make a case for 'null < everything', but IMO
    // it's nicer if the 'clutter' is at the end of the sort.

    // null = 1; undefined = 2; other = 0
    if (a === null) return [ 1, b === undefined ? 2 : 0 ]
    if (b === null) return [ a === undefined ? 2 : 0, 1 ]

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
      // all other types (e.g. symbol, function, boolean) are string-comparable
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

myself.arrayify = "Returns 'howMany' copies of 'item' (which can be a generator function). If 'item' is copy-by-value (e.g. a primitive), this is equivalent to Array(howMany).fill(item)"
const arrayify = (item, howMany = 1) => Array.from({ length: howMany }, (_, i) => {
  if (typeof item === 'function') return item(i)
  else if (typeof item === 'object') return structuredClone(item)
  else return item
})
myself.stringify = "arrayify but for Strings."
const stringify = (snippet = ' ', n = 1, joinWith = '') => {
  return String(joinWith) === '' ?
      String(snippet).repeat(n)
    : arrayify(String(snippet), n).join(joinWith)
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
  // if (!isNum(depth) || depth === Infinity) {
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

myself.iterEquals = "Tests two iterables to see if they are equal. Different permutations of the same elements are considered unequal; to ignore ordering use iterEqualsUnordered."
// Generalized from <https://www.freecodecamp.org/news/how-to-compare-arrays-in-javascript/>
const iterEquals = (a, b) => {
  a = [...a]
  b = [...b]
  return (
    a.length === b.length &&
    a.every((value, index) => value === b[index])
  )
  // prematurely-optimized version:
  a = [...a]
  let i, val
  for ([ i, val ] of entries(b)) {
    if (val !== a[i]) return false
  }
  return i + 1 === a.length
}

myself.iterEqualsUnordered = "Tests two iterables to see if they are equal. Ignores ordering (different permutations of the same elements are considered equal)."
const iterEqualsUnordered = (a, b) => {
  a = makeGroups(a)
  b = makeGroups(b)
  return (a.size === b.size) && a.entries().every(
      ([ key, aGroup ]) => b.has(key) && b.get(key).length === aGroup.length
    )
  // prematurely-optimized(?) version:
  a = makeGroups(a)
  for (const val of b) {
    if (!a.has(val)) return false
    let group = a.get(val)
    if (group.length === 0) return false
    group.pop()
  }
  return a.values().every(group => group.length === 0)
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

myself.stringConverter = "Like msConverter in the numbers module, but for strings (not yet exported). 95% sure this will never be useful."
const stringConverter = (thing) => {
  if (typeof thing !== 'string') {
    if (typeof thing === 'object') return util.inspect(thing, {depth: null})
    else return `${thing}`
  }
  switch (thing) {
    case '':
      return ''
    case 'null':
      return null
    case 'undefined':
      return undefined
    case 'true':
      return true
    case 'false':
      return false
    case 'NaN':
      return NaN
    case 'Infinity':
      return Infinity
    case '-Infinity':
      return -Infinity
    default: {
      // object test
      if ( /function.*{.*}/.test(thing)
        || /=>/.test(thing)
        || /\[.*\]/.test(thing)
        || /{.*}/.test(thing)
      ) { // TODO: some kind of JSON test so non-dangerous objects can be parsed
        console.log(`Warning: I can't let you convert objects, Dave. Returning ${thing} as-is.`)
        return thing
      }
      // integer test
      if (/^[+-]?\d+n?$/.test(thing)) {
        const smallInt = Number(thing)
        return !Number.isInteger(smallInt) || thing.endsWith('n') ?
            BigInt(thing)
          : smallInt
      }
      // float test
      if (/^[+-]?(?:\d*\.?\d+)|(?:\d+\.\d*)(?:e[+-]?\d+)?$/.test(thing)) {
        return Number.parseFloat(thing)
      }
    }
  }
  console.log(`Warning: could not infer type of string ${thing}; returning as-is.`)
  return thing
}

myself.multilineRegex = "Create a RegEx that spans multiple lines (so it can be commented)."
// Source: <https://www.dormant.ninja/multiline-regex-in-javascript-with-comments/>
const multilineRegex = (parts, flags = '') =>
  new RegExp(parts.map(x => (x instanceof RegExp) ? x.source : x).join(''), flags)

myself.fetchAll = "A convenience function for working with paginated APIs."
const fetchAll = async (uri, getNext = (json) => json.links.next) => {
  const allData = []
  let next = uri
  while (next != null) {
    const result = await fetch(next)
    const json = await result.json()
    allData.push(...json.data)
    next = getNext(json)
  }
  return allData
}

// TODO: new array/iterable submodule 'iters'
// array object { swap, last, etc. } *and* iterable submodule?
// also include getSorter
module.exports = {
  // docs: () => print(myself),
  aboutMe: () => myself.aboutMe,
  allAboutMe: () => myself,
  backToWork,
  len,
  range,
  zip,
  entries,
  defaultOrAny,
  print,
  printFn,
  printVar,
  printVars,
  pluralize,
  ifFunc,
  TypeCheckedArray,
  isTruthy,
  isIterable,
  isEmpty,
  ensureIterable,
  ensureArray ,
  memoize,
  timeIt,
  makeGroups,
  makeWeakGroups,
  deDup,
  findDupes,
  findUniques,
  getSorter,
  arrayify,
  stringify,
  swap,
  flattener,
  iterEquals,
  iterEqualsUnordered,
  getIter,
  multilineRegex,
  fetchAll,
} // = require('./general')

// for organization? (future):
// module.exports = {
  // ...textStuff,
  // ...someOtherGroupOfStuffNotBigEnoughToBeAModule,
  // other,
  // miscellaneous,
  // functions,
// }
