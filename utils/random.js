const coinFlip = () => Math.random() < 0.5
const randNum = (lessThan) => Math.random() * lessThan
const randInt = (lessThan) => Math.floor(randNum(lessThan))
const randDigit = () => randInt(10)
const randDigitString = (length) => {
  let digits = []
  while (length > 0) {
    digits.push(randDigit())
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
  // Alternate implementation - may be slower? (Arguably more intuitive)
  // let newOrder = []
  // let unshuffled = Object.keys(arr)
  // let pickFrom = Object.keys(unshuffled)
  // while (pickFrom.length) {
    // let pick = randChoice(pickFrom)
    // newOrder.push(arr[pick])
    // delete unshuffled[pick]
    // pickFrom = Object.keys(unshuffled)
  // }
  // return newOrder
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
