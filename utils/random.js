const myself = {} // documentation
const { print, swap } = require('./general')

myself.coinFlip = "Returns a boolean with a 50-50 chance of being true."
const coinFlip = () => Math.random() < 0.5

myself.randNum = "Returns a random number in the range [0, lessThan)."
const randNum = (lessThan) => Math.random() * lessThan

myself.randInt = "Returns a random integer in the range [0, lessThan)."
const randInt = (lessThan) => Math.trunc(randNum(lessThan))

myself.randDigit = "Returns a random integer in the range [0, 9]."
const randDigit = () => randInt(10)

myself.randDigitString = "Returns a string of random digits of the given length."
const randDigitString = (length) => {
  let digits = []
  while (length > 0) {
    digits.push(randDigit())
    length -= 1
  }
  return digits.join('')
}

myself.randChoice = "Returns a random element from the given array."
const randChoice = (arr) => arr[randInt(arr.length)]

myself.shuffled = "Returns a shuffled copy of the given array."
const shuffled = (arr) => {
  arr = [...arr]
  for (let end = arr.length - 1; end > 0; end--) {
    let swapFrom = randInt(end + 1) // elements can be 'swapped' with themselves
    [ arr[end], arr[swapFrom] ] = [ arr[swapFrom], arr[end] ]
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
  docs: () => print(myself),
  coinFlip,
  randNum,
  randInt,
  randDigit,
  randDigitString,
  randChoice,
  shuffled,
}
