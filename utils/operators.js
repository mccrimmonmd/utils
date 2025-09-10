const myself = {
  aboutMe: "Functional equivalents of JavaScript's native operators."
}
const { pluralize } = require('./general')
const { andReduce, sum, product } = require('./reducers')

const op = (opType) => opFuncs[opType] ?? opFuncs.err(
  `Unsupported or invalid operator '${opType}'`,
  TypeError,
)
const parityError = (opType, n = 2) => opFuncs.err(
  `Operator '${opType}' requires at least ${n} ${pluralize('argument', n)}`,
  TypeError,
)

const opFuncs = {
  aboutMe: () => myself.aboutMe,

  // non-chaining operators //

  id: (thing) => thing, // the identity function
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

  switcher: ({
    switchOn,
    tasks = [],
    defaultTask,
    matchAll = true,
    fallthrough = false
  }) => {
    let noMatch = true
    let fellthrough = false
    let result
    for (const { cases, task, params = [], me = this } of tasks) {
      if (cases.includes(switchOn) || fellthrough) {
        noMatch = false
        fellthrough = fallthrough
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

  // logical operators (all short-circuiting) //
  // (actually not short-circuiting, since parameters are evaluated at call time?)

  // 'choose' does not short-circuit by default, but it's easy to implement:
  // just pass functions and call the result 👇
  // `op('choose')(isSpam(x), () => doSpamThing(x), () => doEggsThing(x))()`
  choose: (cond, ifTrue, ifFalse) => cond ? ifTrue : ifFalse,

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

  any: (paramIter, test = (a) => !!a) => orReduce(
    paramIter,
    (_, thing) => test(thing),
    null
  ),

  all: (paramIter, test = (a) => !!a) => andReduce(
    paramIter,
    (_, thing) => test(thing),
    null
  ),
}

module.exports = op
