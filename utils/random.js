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
  // Alternate implementation - slower, but more intuitive
  // let pickACard = Object.keys(arr)
  // let newArr = []
  // while (pickACard.length) {
    // let anyCard = randInt(pickACard.length)
    // let pick = pickACard[anyCard]
    // newArr.push(arr[pick])
    // pickACard.splice(anyCard, 1)
  // }
  // return newArr
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
