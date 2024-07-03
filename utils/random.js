const myself = {} // documentation
const { print, swap, arrayOf } = require('./general')

myself.coinFlip = "Returns a boolean with a 50-50 chance of being true."
const coinFlip = () => Math.random() < 0.5

myself.randNum = "Returns a random number in the range [0, lessThan)."
const randNum = (lessThan) => Math.random() * lessThan

myself.randInt = "Returns a random integer in the range [0, lessThan)."
const randInt = (lessThan) => Math.trunc(randNum(lessThan))

myself.rollDie = "Same as randInt, but with 1 added to the result."
const rollDie = (sides=6) => randInt(sides) + 1

myself.rollDice = "Returns an array of random integers between 1 and 'sides', inclusive"
const rollDice = (number, sides=6) => {
  let roller = () => rollDie(sides)
  return arrayOf(number, roller)
}

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

myself.removeRandChoice = "Removes (in-place) a random element from the given array. Returns the removed element."
const removeRandChoice = (arr) => arr.splice(randInt(arr.length), 1)

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
  rollDie,
  rollDice,
  randDigit,
  randDigitString,
  randChoice,
  removeRandChoice,
  shuffled,
}
