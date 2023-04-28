const { randInt, randDigit, randChoice, coinFlip } = require('./random')

const getNum = () => randDigit() * coinFlip() ? -1 : 1
const getString = () => {
  let str = ''
  for (let i = 0; i < randDigit() + 1; i++) {
    str += randChoice(LETTERS)
  }
  return str
}
const getBool = coinFlip
const getArr = (maxLength) => {
  let arr = []
  for (let i = 0; i < randInt(maxLength) + 1; i++) {
    arr.push(randChoice(GETTERS)(maxLength))
  }
  return arr
}
const getObj = (maxLength) => {
  let obj = {}
  for (let i = 0; i < randInt(maxLength) + 1; i++) {
    obj[LETTERS[i]] = randChoice(GETTERS)(maxLength)
  }
  return obj
}
const getFunc = () => ()=>{}

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('')
const GETTERS = [getNum, getString, getBool, getArr, getObj]

module.exports = ({
  baseLength=5, 
  nestedLength=baseLength, 
  funcsAllowed=false
} = {}) => {
  if (funcsAllowed) GETTERS.push(getFunc)
  // TODO: set maximum nesting depth to avoid busting the stack
  // (or flatten the recursion)
  if (baseLength > LETTERS.length) baseLength = LETTERS.length
  if (nestedLength > LETTERS.length) nestedLength = LETTERS.length
  let object = {}
  for (let i = 0; i < baseLength; i++) {
    object[LETTERS[i]] = getObj(nestedLength)
  }
  return object
}
