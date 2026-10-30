const myself = {
  aboutMe: "Functional equivalents of JavaScript's native operators."
}
const { pluralize } = require('./general')
const { orReducer, andReducer, iterReducer, sum, product } = require('./reducers')

const op = (opType) => opFuncs[opType] ?? opFuncs.err(
  `Unsupported or invalid operator '${opType}'`,
  TypeError,
)
const parityError = (opType, n = 2) => opFuncs.err(
  `Operator '${opType}' requires at least ${n} ${pluralize('argument', n)}`,
  TypeError,
)

const compare = (type, params) => {
  let func
  switch (type) {
    case 'lt':
      func = (a, b) => (a < b)
      break
    case 'lte':
      func = (a, b) => (a <= b)
      break
    case 'gt':
      func = (a, b) => (a > b)
      break
    case 'gte':
      func = (a, b) => (a >= b)
      break
    case 'eq':
      func = (a, b) => (a === b)
      break
    default:
      return opFuncs.err(
        `Unsupported or invalid comparison operator '${type}'`,
        TypeError
      )
  }
  return (...params) => {
    if (type === 'eq') {
      if (params.length < 1) return parityError('eq', 1)
      return params.reduce(andReducer(func), params[0])
    }
    else {
      if (params.length <= 1) return parityError(type)
      return params.reduce(andReducer(func))
    }
  }
}

const opFuncs = {
  aboutMe: myself.aboutMe,
  allAboutMe: (function () { return Object.keys(this) })()

  // non-chaining operators //

  id: (thing) => thing, // the identity function
  identity: (function () { return this.id })(),
  first: (...things) => things[0],
  last: (...things) => things.at(-1),
  err: (message, errType = Error) => (() => { throw new errType(message) })(),

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

  // TODO: add (or replace) different switch-like: switch/do/dont
  // (or on/off) -- make fall-through more explicit and allow
  // execution to be 'switched' back on (instead of just breaking
  // out of the op entirely)
  
  switcher: ({
    switchOn,
    tasks = [],
    defaultTask,
    matchAll = true,
  }) => {
    let noMatch = true
    let fellthrough = false
    let result
    for (const { cases, task, params = [], me = this, fallthrough = false } of tasks) {
      fellthrough = fallthrough && fellthrough
      if (cases.includes(switchOn) || fellthrough) {
        noMatch = false
        fellthrough = true
        result = task.apply(me, params)
        if (!matchAll) break
      }
    }
    if (noMatch && defaultTask != null) {
      const { task, params = [], me = this } = defaultTask
      result = task.apply(me, params)
    }
    return result
  },

  // chaining operators (numeric) //

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

  // chaining operators (logical) (short-circuiting) //
  // (actually not short-circuiting? since parameters are evaluated at call time?)

  // 'choose' does not short-circuit by default, but it's easy to implement:
  // just pass functions and call the result 👇
  // `op('choose')(isSpam(x), () => doSpamThing(x), () => doEggsThing(x))()`
  choose: (cond, ifTrue, ifFalse) => cond ? ifTrue : ifFalse,

  lt: compare('lt'),
  lte: compare('lte'),
  gt: compare('gt'),
  gte: compare('gte'),
  eq: compare('eq'),

  any: (iter, test = (a) => !!a) =>
    iterReducer(iter, (soFar, thing) => soFar || test(thing), false),
  all: (iter, test = (a) => !!a) =>
    iterReducer(iter, (soFar, thing) => soFar && test(thing), true),
}

module.exports = op
