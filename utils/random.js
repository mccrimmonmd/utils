const myself = {
  // module: "Functions for generating and using random numbers."
}
const { print, swap, arrayify } = require('./general')

myself.coinFlip = "Returns a boolean with a 50-50 chance of being true."
const coinFlip = () => Math.random() < 0.5

myself.randNum = "Returns a random number in the range [0, lessThan)."
const randNum = (lessThan) => Math.random() * lessThan

myself.randInt = "Returns a random integer in the range [0, lessThan)."
const randInt = (lessThan) => Math.trunc(randNum(lessThan))

myself.rollDie = "Same as randInt, but with 1 added to the result."
const rollDie = (sides = 6) => randInt(sides) + 1

myself.rollDice = "Returns an array of random integers between 1 and 'sides', inclusive."
const rollDice = (howMany, sides = 6) => arrayify(() => rollDie(sides), howMany)

myself.randDigit = "Returns a random integer in the range [0, 9]."
const randDigit = () => randInt(10)

myself.randDigitString = "Returns a string of random digits."
const randDigitString = (length) => arrayify(randDigit, length).join('')

myself.randChoice = "Returns a random element from the given array."
const randChoice = (arr) => arr[randInt(arr.length)]

myself.randRemove = "Removes (in-place) and returns a random element from the given array."
const randRemove = (arr) => arr.splice(randInt(arr.length), 1)[0]

myself.shuffle = "Shuffles (in-place) and returns the given array."
const shuffle = (arr) => {
  for (let end = arr.length - 1; end > 0; end--) {
    let swapFrom = randInt(end + 1) // elements can be 'swapped' with themselves
    swap(arr, swapFrom, end)
  }
  return arr
}

myself.shuffled = "Returns a shuffled copy of the given array."
const shuffled = (arr) => shuffle([...arr])
// Alternate implementation - slower, but more intuitive
// (also works on sparse arrays)
//   let oldDeck = arr
//   let pickACard = Object.keys(oldDeck)
//   let newDeck = []
//   while (pickACard.length) {
//     let anyCard = randInt(pickACard.length)
//     let pick = pickACard[anyCard]
//     newDeck.push(oldDeck[pick])
//     pickACard.splice(anyCard, 1)
//   }
//   return newDeck
// }

module.exports = {
  docs: () => print(myself),
  // aboutMe: () => myself.module,
  // allAboutMe: () => myself
  coinFlip,
  randNum,
  randInt,
  rollDie,
  rollDice,
  randDigit,
  randDigitString,
  randChoice,
  randRemove,
  shuffle,
  shuffled,
}
