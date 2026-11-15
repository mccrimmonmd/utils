const myself = {
  aboutMe: "blah blah blah lists and iterables and stuff"
}

const { max, min, anyDefault } = require('./reducers')

myself.len = "Python-style function for getting the length of an iterable in a null- and type-safe way (because I'm tired of writing `!arr?.length` over and over)."
const len = (thing) =>
  thing == null || !isIterable(thing) ? NaN
  : thing.length != null ? thing.length
  : thing.size != null ? thing.size
  : [...thing].length

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
  for (let i = start; start < stop ? i < stop : i > stop; i += step) {
    yield i
  }
}

myself.zip = "Python-style zip function: combines a list of arrays into a list of pairs/triplets/etc. Takes an optional parameter for padding the results when the input arrays are different lengths; if none is provided, the output will be the length of the shortest input array."
const zip = (arrays, ...padding) => {
  const [ padResults, padWith ] = anyDefault(padding)
  const zipped = []
  const zippedLen = arrays
    .map(array => array.length)
    .reduce(padResults ? max : min)
  for (const i of range(zippedLen)) {
    let group = arrays.map(array => i < array.length ? array[i] : padWith)
    zipped.push(group)
  }
  return zipped
}

myself.zipIter = "Same as zip, but accepts a list of any iterables as input and returns a generator instead of an Array."
const zipIter = function* (iterables, ...padding) {
  const [ padResults, padWith ] = anyDefault(padding)
  const iterators = iterables.map(iterable => iterable[Symbol.iterator]())
  const getNext = () => iterators.map(iter => iter.next())
  let results = getNext()
  while (results[padResults ? 'some' : 'every'](result => !result.done)) {
    yield results.map(result => result.done ? padWith : result.value)
    results = getNext()
  }
}

myself.entries = "A generic version of Array.prototype.entries that works with any iterable."
const entries = function* (iterable) {
  if (typeof iterable.entries === 'function') return yield* iterable.entries()
  let i = 0
  const iterator = iterable[Symbol.iterator]()
  let entry = iterator.next()
  while (!entry.done) {
    yield [i, entry.value]
    i += 1
    entry = iterator.next()
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

myself.WrappedBoundsArray = "A subclass of Array that 'wraps around' indicies outside its bounds. More precisely, the index is taken modulo the array's length, and if the result is negative the array's length is added to it: `arr[-1]` will return the last element, `arr[arr.length]` will return the first element, and so on."
// TODO: fix mutating methods (push, splice with 3rd parameter, possibly others)
// (copying and iterating seem to be fine, but
// probably worth doing extra testing also)
const WrappedBoundsArray = class extends Array {
  static #wrapIndex(arr, prop) {
    if (['number', 'bigint', 'string'].includes(typeof prop)) {
      let i = Number(prop)
      if (Number.isInteger(i)) {
        i = i % arr.length
        prop = i < 0 ? i + arr.length : i
      }
    }
    return prop
  }
  constructor (...params) {
    super(...params)
    return new Proxy(
      this,
      {
        get(target, prop, receiver) {
          prop = WrappedBoundsArray.#wrapIndex(target, prop)
          return Reflect.get(target, prop, receiver)
        },
        set(target, prop, value, receiver) {
          prop = WrappedBoundsArray.#wrapIndex(target, prop)
          return Reflect.set(target, prop, value, receiver)
        },
      }
    )
  }
}

myself.isIterable = "A more concise test for iterability."
const isIterable = (thing) => typeof thing?.[Symbol.iterator] === 'function'

myself.ensureIterable = "Wraps the parameter in an array, unless it's already iterable."
const ensureIterable = (thing) => isIterable(thing) ? thing : [thing]

myself.ensureArray = "Wraps the parameter in an array and returns it. If the parameter is iterable, it spreads it into the array before returning it. If the parameter is already an array, it is returned as-is. For when you want to avoid making unnecessary copies and/or you're not sure the parameter will be iterable. (If you know the paramater will either be an array OR a non-iterable, and you don't mind making a copy, `[].concat(thing)` is more concise.)"
const ensureArray = (thing) =>
  Array.isArray(thing) ? thing
  : isIterable(thing) ? [...thing]
  : [thing]

myself.makeGroups = "Sorts an iterable into caller-determined 'buckets' (default: identity). Returns a Map. (Yet another function I worked super hard on that's already in the spec, lol)"
const makeGroups = (iterable, idFunc = (thing) => thing) =>
  Map.groupBy(iterable, idFunc)

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

myself.repeat = "Returns 'howMany' copies of 'item' (which can be a generator function). If 'item' is copy-by-value (e.g. a primitive), this is equivalent to Array(howMany).fill(item)"
// TODO: refactor to accept any class with a static 'from' method (default Array)?
const repeat = (item, howMany = 1) => Array.from({ length: howMany }, (_, i) => {
  if (typeof item === 'function') return item(i)
  else if (typeof item === 'object') return structuredClone(item)
  else return item
})

myself.swap = "Swaps two elements of an Array (in-place). Returns the modified array."
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
// TODO: test (I wonder if I could get the best of both worlds by combining a plain loop 
// with a call to Array.prototype.flat?)
// TODO: 'batch' calls to flat in groups of 1000 or so for speed? i.e.:
// for (const _ of range(0n, depth, 1000n) {
//   if (...) {
//     array = array.flat(1000)
//   }
// else ...
const flattener = (array, depth = 1) => {
  if (!['number', 'bigint'].includes(typeof depth)) {
    throw new TypeError('Depth must be a number')
  }
  if (!array.length) return array
  if (depth < 5000) return array.flat(depth)
  array = [...array]
  for (const _ of range(0n, depth)) {
    if (array.some(value => Array.isArray(value))) {
      array = array.flat()
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
  let i = 0
  for (const val of b) {
    if (val !== a[i]) return false
    i += 1
  }
  return a.length === i
  // OR BETTER:
  for (const [ aVal, bVal ] of zipIter([a, b], Symbol())) {
    if (aVal !== bVal) {
      return false
    }
  }
  return true
}

myself.iterEqualsUnordered = "Tests two iterables to see if they are equal. Ignores ordering (different permutations of the same elements are considered equal)."
const iterEqualsUnordered = (a, b) => {
  a = makeGroups(a)
  b = makeGroups(b)
  return (a.size === b.size)
    && a.entries().every(
      ([ key, aGroup ]) => b.has(key) && b.get(key).length === aGroup.length
    )
  // prematurely-optimized version:
  a = makeGroups(a)
  let bSize = 0
  for (const val of b) {
    if (!a.has(val)) return false
    let group = a.get(val)
    if (group.length === 0) return false
    group.pop()
    if (group.length === 0) bSize += 1
  }
  return a.size === bSize
}

// TODO: rename, document
// <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#set_composition>
const compareItersBy = (type) => (a, b) => [...new Set(a)[type](new Set(b))]
const getIter = {
  diff: compareItersBy('difference'),
  intersection: compareItersBy('intersection'),
  union: compareItersBy('union'),
  biDiff: compareItersBy('symmetricDifference'),
}

module.exports = {
  aboutMe: () => myself.aboutMe,
  allAboutMe: () => myself,
  len,
  range,
  zip,
  zipIter,
  entries,
  TypeCheckedArray,
  WrappedBoundsArray,
  isIterable,
  ensureIterable,
  ensureArray,
  makeGroups,
  makeWeakGroups,
  deDup,
  findDupes,
  findUniques,
  repeat,
  swap,
  flattener,
  iterEquals,
  iterEqualsUnordered,
  getIter,
}

