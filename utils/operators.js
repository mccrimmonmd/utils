const { pluralize } = require('./general')
const { andReduce, sum, product } = require('./reducers')

const op = (opType) => opFuncs[opType] ?? opFuncs.err(
  `Unsupported or invalid operator '${opType}'`, TypeError
)
const parityError = (opType, n = 2) => {
  throw new TypeError(
    `Operator '${opType}' requires at least ${n} ${pluralize('argument', n)}`
  )
}
const opFuncs = {

  // non-chaining operators //

  err: (message, errType = Error) => (() => { throw new errType(message) })(),

  id: (thing) => thing,

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
        fellthrough = fallthrough
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

  // chaining operators //

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
    return andReduce(params, (a, b) => (a < b))
  },
  lte: (...params) => {
    if (params.length <= 1) return parityError('lte')
    return andReduce(params, (a, b) => (a <= b))
  },
  gt: (...params) => {
    if (params.length <= 1) return parityError('gt')
    return andReduce(params, (a, b) => (a > b))
  },
  gte: (...params) => {
    if (params.length <= 1) return parityError('gte')
    return andReduce(params, (a, b) => (a >= b))
  },
  eq: (...params) => {
    if (params.length < 1) return parityError('eq', 1)
    return andReduce(params, (a, b) => a === b, params[0])
  },

  // short-circuiting operators //
  
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

module.exports = op
