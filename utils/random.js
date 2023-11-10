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
const shuffled = (arr) => {
  arr = [...arr]
  for (let swapTo = arr.length - 1; swapTo > 0; swapTo--) {
    let swapFrom = randInt(swapTo + 1)
    let swapped = arr[swapFrom]
    arr[swapFrom] = arr[swapTo]
    arr[swapTo] = swapped
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
