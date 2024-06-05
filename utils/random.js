const coinFlip = () => Math.random() < 0.5
const randNum = (lessThan) => Math.random() * lessThan
const randInt = (lessThan) => Math.trunc(randNum(lessThan))
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
  for (let end = arr.length - 1; end > 0; end--) {
    let swapFrom = randInt(end + 1) // elements can be 'swapped' with themselves
    let swapping = arr[swapFrom]
    arr[swapFrom] = arr[end]
    arr[end] = swapping
  }
  return arr
}
// Alternate implementation - slower, but more intuitive
  // let oldDeck = arr
  // let pickACard = Object.keys(oldDeck)
  // let newDeck = []
  // while (pickACard.length) {
    // let anyCard = randInt(pickACard.length)
    // let pick = pickACard[anyCard]
    // newDeck.push(oldDeck[pick])
    // pickACard.splice(anyCard, 1)
  // }
  // return newDeck
// }

module.exports = {
  coinFlip,
  randNum,
  randInt,
  randDigit,
  randDigitString,
  randChoice,
  shuffled,
}
