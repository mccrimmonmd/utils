/**
  Functions for generating and using random numbers.
  @module
*/
const { swap, repeat } = require('./sequences')

/** Returns a boolean with a 50-50 chance of being true. */
const coinFlip = () => Math.random() < 0.5

/** Returns a random number in the range [0, lessThan). */
const randNum = (lessThan) => Math.random() * lessThan

/** Returns a random integer in the range [0, lessThan). */
const randInt = (lessThan) => Math.trunc(randNum(lessThan))

/** Same as randInt, but with 1 added to the result. */
const rollDie = (sides = 6) => randInt(sides) + 1

/** Returns an array of random integers between 1 and 'sides', inclusive. */
const rollDice = (howMany, sides = 6) => repeat(() => rollDie(sides), howMany)

/** Returns a random integer in the range [0, 9]. */
const randDigit = () => randInt(10)

/** Returns a string of random digits. */
const randDigitString = (length) => repeat(randDigit, length).join('')

/** Returns a random element from the given array. */
const randChoice = (arr) => arr[randInt(arr.length)]

/** Removes (in-place) and returns a random element from the given array. */
const randRemove = (arr) => arr.splice(randInt(arr.length), 1)[0]

/** A simple closure for implementing removal without replacement. */
const grabBag = (contents) => {
  contents = [...contents]
  return {
    get contents() {
      return [...contents]
    },
    grab: () => randRemove(contents)
  }
}

/** Shuffles (in-place) and returns the given array. */
const shuffle = (arr) => {
  for (let end = arr.length - 1; end > 0; end--) {
    let swapFrom = randInt(end + 1) // elements can be 'swapped' with themselves
    swap(arr, swapFrom, end)
  }
  return arr
}

/** Returns a shuffled copy of the given array. */
const shuffled = (arr) => shuffle([...arr])

module.exports = {
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
