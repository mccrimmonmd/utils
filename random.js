const randNum = (lessThan) => Math.random() * lessThan
const randInt = (lessThan) => Math.floor(randNum(lessThan))
const randDigit = () => randInt(10)
const randDigitString = (length) => {
  let digits = []
  while (length > 0) {
    digits.push(randInt())
    length -= 1
  }
  return digits.join('')
}
const randChoice = (arr) => arr[randInt(arr.length)]
const shuffle = (arr) => {
  for (let i = arr.length; i > 1; i--) {
    let place = randInt(i)
    let tmp = arr[place]
    arr[place] = arr[i - 1]
    arr[i - 1] = tmp
  }
  return arr
}
const coinFlip = () => Math.random() < 0.5

module.exports = {
  randNum,
  randInt,
  randDigit,
  randDigitString,
  randChoice,
  shuffle,
  coinFlip,
}
