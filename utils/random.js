const coinFlip = () => Math.random() < 0.5
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
  // let result = []
  // let unshuffled = Object.keys(arr)
  // for (item of arr) {
    // let pick = randChoice(Object.keys(unshuffled))
    // result.push(arr[pick])
    // delete unshuffled[pick]
  // }
  // return result
  arr = [...arr]
  for (let swapTo = arr.length - 1; swapTo > 0; swapTo--) {
    let swapFrom = randInt(swapTo + 1)
    let swapped = arr[swapFrom]
    arr[swapFrom] = arr[swapTo]
    arr[swapTo] = swapped
  }
  return arr
}

module.exports = {
  coinFlip,
  randNum,
  randInt,
  randDigit,
  randDigitString,
  randChoice,
  shuffled,
}
