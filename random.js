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
  for (let i = arr.length - 1; i > 0; i--) {
    let place = randInt(i + 1)
    let tmp = arr[place]
    arr[place] = arr[i]
    arr[i] = tmp
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
