// TODO: switch to deno (contribute for Rust practice?) or bun
// TODO: publish to repo! (e.g. npm)
// TODO: ***testing*** (write own toolset??)
// TODO: transition to JSDoc (and/or TypeScript)
//       (mutually exclusive with doing my own testing?)

// TODO: make 'common' module for top-level and rename 'general'
// (to...? 'development'? 'meta'? 'misc'?)
// alternate alternatively, move functions used by many other modules to
// private 'essential/noDeps' module (to avoid import cycles), re-export
// those functions to toplevel/wherever needed

const myself = {
  aboutMe: `A collection of ECMAScript functions for many common (and some uncommon) development tasks. The 'general' module contains functions focused on debugging, property tests, and metaprogramming, along with a few 'just for fun'/niche/miscellaneous functions. Some especially common/useful functions are re-exported from more specialized modules.

  Run \`allAboutMe()\` within any module to see documentation of its functions.`
} 

const { anyDefault } = require('./reducers')
const { range, isIterable, ensureIterable, makeGroups, repeat } = require('./sequences') // for re-export

const backToWork = require('./BACK TO WORK')
myself.backToWork = backToWork

myself.print = "console.dir shorthand. Also returns the printed object (instead of undefined)."
const print = (obj, depth = null) => {
  console.dir(obj, { depth })
  return obj
}

myself.printVar = "For logging the name, location, and value of a variable in a structured way. Returns an object with the logged information."
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
  return { value, name, location }
}
myself.printVars = "Uses printVar to log multiple variables."
const printVars = (...variables) => {
  const results = []
  for (const variable of variables) results.push(printVar(...ensureIterable(variable)))
  return results
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

myself.isTruthy = "Javascript's truthiness rules are obnoxious and I always second-guess myself when trying to remember them."
const isTruthy = (thing) => thing ? 'yes' : 'no'

myself.isEmpty = "Determines whether a value counts as 'something' or 'nothing'. Used in objects.merge. Empty collections, zero-length iterables, and most falsy values are considered empty; but booleans and numbers (including false, 0, and NaN) are *not* considered empty. Defaults can be overridden by <CHECKING 4 EXCEPTIONS URSELF U LAZY BUM>."
const isEmpty = (value) => {
  if (value == null) return true
  if (['boolean', 'number', 'bigint'].includes(typeof value)) return false
  if (typeof value === 'function') {
    // this will probably never be useful, but it was a fun regex exercise
    const arrowRegex = multilineRegex( // regex parts paraphrased below:
      /^\(\)=>(?:{;*)?/,               // () => { ;*
      /(?:return)?(?:undefined)?;*}?$/ // return? undefined? ;* }
    )
    const funcRegex = multilineRegex(
      /^function(?:\*?[\w]*)\(\){/,    // function *? name? () {
      /;*(?:return(?:undefined)?;*)?/, // ;* return? undefined? ;*
      /}$/                             // }
    )
    const valueString = value.toString().replaceAll(/\s/g, '')
    return arrowRegex.test(valueString) || funcRegex.test(valueString)
  }
  if (value.length != null) return value.length === 0
  if (value.size != null) return value.size === 0
  if (isIterable(value)) {
    for (const _ of value) return false
    return true
  }
  if (typeof value === 'object') return Object.keys(value).length === 0
  // TODO: anything else to test?
  return !value
}

myself.memoize = "Wraps a (possibly expensive) function in a closure that memoizes its return value. NOTE: if the original function is anonymous and recursive, it must be set to the same variable--`someFunc = memoize(someFunc)`--or wrapped in a closure first--`memoized = memoize( (() => someFunc)() )`--to be memoized properly."
// TODO: fix 'new name must be old name' thing...somehow?
// ASSUMES that 'func' is an actual function! In particular: When called with the same arguments, it must return the same result; and it should have no side effects (if a cached result is used, any side effects will be skipped!)
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
    const [ mutating, value ] = anyDefault(newValue)
    const singleArgument = argumentsList.length === 1
    const noArgument = argumentsList.length === 0
    const first =
      singleArgument ? argumentsList[0]
      : noArgument ? this.#noArgsKey
      : this.#rootKey

    let hasKey = super.has(first)
    if (singleArgument || noArgument) {
      let oldValue = super.get(first)
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
  const start = performance.now()
  const result = func.apply(me, params)
  const time = performance.now() - start
  if (!silent) console.log(`Time taken: ${time / 1_000} seconds`)
  return {
    result,
    time,
  }
}

myself.dateFilter = "TODO: use with upcoming Temporal object to make utils for searching and filtering dates."
// TODO: parse dates/get 'today' with Temporal instead of moment
// TODO: export all (possibly in separate module)
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
      return diff >= 0 && diff <= days // from --days-after-->
    }
    else {
      return diff < 0 && diff >= days // <--days-before-- from
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

myself.getSorter = "Returns a sorting function that behaves more sanely than the default (specifically: mixed-case text, text with diacritics, and numbers sort the way you would expect; Objects are sorted with util.inspect; and mixed-type arrays are sorted by type first, then value). Accepts a parameter for what to sort on that can be: undefined/null (identity), a string/symbol (for key lookup), a function (that returns the value to sort on), or an array of any mix of the three (for breaking ties)."
const getSorter = (sortOn, sortOrder = 'ascending') => {
  // In addition to a saner sort order, this function has a secondary goal of
  // sorting arbitrary permutations *unambiguously.* That is, for any given
  // Array arr, `shuffle(arr).sort(getSorter())` should return the same
  // permutation every time (this may or may not be possible).
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

    // for similar reasons, NaN is sorted to the end of the numbers
    const [ aType, bType ] = [ typeof a, typeof b ]
    if (aType !== bType) return [ aType, bType ]
    if (aType === 'bigint') return [ a, b ]
    if (aType === 'number') {
      if (isNaN(a) || isNaN(b)) {
      // TODO: I don't think this will work, actually
        if (!isNaN(a)) return [ 'NaN', a ]
        if (!isNaN(b)) return [ 'NaN', b ]
        return [ 'NaN', 'NaN' ]
      }
      else return [ a, b ]
    }

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

// TODO: document, export
const convertToString = (thing, depth = null) => {
  if (typeof thing === 'object') {
    return util.inspect(thing, { depth })
  }
  return String(thing)
}
// TODO: export
myself.convertFromString = "Like msConverter in the numbers module, but for strings (not yet exported). 95% sure this will never be useful."
const convertFromString = (str) => {
  if (typeof str !== 'string') return str
  switch (str) {
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
      // don't try to parse objects (unsafe)
      if (/function|=>|\[.*\]|{.*}/.test(str)) {
        console.warn(`Sorry Dave, I can't let you convert objects. Returning input as-is: ${str}`)
        return str
      }
      // integer test
      if (/^[+-]?\d+n?$/.test(str)) {
        const smallInt = Number(str)
        return (
          str.endsWith('n')
            || !Number.isInteger(smallInt)
            || smallInt > Number.MAX_SAFE_INTEGER
            || smallInt < Number.MIN_SAFE_INTEGER 
        ) ?
            BigInt(str)
          : smallInt
      }
      // float test
      if (
        multilineRegex(
          /^[+-]?/, // sign
          /(?:\.?\d+|\d+\.\d*)/, // digits
          /(?:e[+-]?\d+)?$/, // in sci. notation?
        ).test(str)
      ) {
        return Number.parseFloat(str)
      }
    }
  }
  console.warn(`Could not infer type of input string. Returning as-is: ${str}`)
  return str
}

myself.multilineRegex = "Create a RegEx that spans multiple lines (so it can be commented)."
// Derived from: <https://www.dormant.ninja/multiline-regex-in-javascript-with-comments/>
const multilineRegex = (...parts) => {
  let flags = ''
  if (Array.isArray(parts[0])) {
    flags = parts[1]
    parts = parts[0]
  }
  return new RegExp(parts.map(
    (x) => (x instanceof RegExp) ? x.source : x
  ).join(''), flags)
}

myself.fetchAll = "A convenience function for working with paginated APIs."
const fetchAll = async (uri, getNext, getData = (json) => json.data) => {
  const allData = []
  let next = uri
  while (next != null) {
    const result = await fetch(next)
    const json = await result.json()
    allData.push(...getData(json))
    next = getNext(json)
  }
  return allData
}

module.exports = {
  aboutMe: () => myself.aboutMe,
  allAboutMe: () => myself,
  backToWork,
  range,
  print,
  printVar,
  printVars,
  pluralize,
  ifFunc,
  isTruthy,
  isIterable,
  isEmpty,
  memoize,
  timeIt,
  makeGroups,
  getSorter,
  repeat,
  multilineRegex,
  fetchAll,
} // = require('./general')

