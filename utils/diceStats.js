const myself = {} // documentation
const { print, arrayOf } = require('./general')
const { sum, roundDecimal } = require('./numbers')
const { rollDie, rollDice } = require('./random')
const { allKeys } = require('./objects')

myself.rollDie = "Simulates a single roll of a die. Defaults to d6"
myself.rollDice = "Generates a list of random dice rolls. Defaults to 4d6"

const countSides = (dice = 4, sides) => {
  // 'sides' is optional, but it can't be a default parameter because the
  // default changes depending on whether 'dice' is a number or an array
  if (Array.isArray(dice)) {
    sides = sides ?? Math.max(...dice)
  }
  else {
    sides = sides ?? 6
    dice = rollDice(dice, sides)
  }
  let multiples = arrayOf(sides, 0)
  for (const result of dice) multiples[result - 1] += 1
  return multiples
}

const getShortNames = (multiples) => {
  let names = {}
  for (const count of multiples) {
    if (count < 2) continue
    let howMany = names[`${count}s`]
    names[`${count}s`] = (howMany ?? 0) + 1
  }
  return names
}

const getFullName = (shortNames) => {
  const shortNamesArray = Object.keys(shortNames).sort().reverse()
  if (shortNamesArray.length === 0) {
    return 'singles'
  }
  const shortName = shortNamesArray[0]
  const count = shortNames[shortName]
  switch (shortName) {
    case '6s':
      return 'sexts'
    case '5s':
      return 'quints'
    case '4s':
      if (shortNamesArray.includes('2s')) return 'twoAndFour'
      return 'quads'
    case '3s':
      if (count === 2) return 'twoTrips'
      else if (shortNamesArray.includes('2s')) return 'fullHouse'
      return 'trips'
    case '2s':
      if (count === 3) return 'threePair'
      else if (count === 2) return 'twoPair'
      return 'dubs'
    default:
      console.warn(`unsupported short name ${shortName}; analysis functions may fail`)
      return shortName
  }
}

"Private helper function (for generating an initial value for the reduce in fullNameStats)"
const initializeNames = (results) => {
  const shortNames = allKeys(results)
  let fullNames = {
    singles: 0,
    dubs: 0,
    trips: 0,
    twoPair: 0,
    quads: 0,
  }
  if (shortNames.includes('5s')) {
    fullNames = {
      fullHouse: 0,
      quints: 0,
      ...fullNames,
    }
  }
  if (shortNames.includes('6s')) {
    fullNames = {
      twoTrips: 0,
      threePair: 0,
      twoAndFour: 0,
      sexts: 0,
      ...fullNames
    }
  }
  return fullNames
}

const fullNameStats = (results, normalize = false) => {
  let fullNames
  for (const multiples of results) {
    fullNames = getFullName(getShortNames(multiples), fullNames)
  }
  if (normalize) {
    let total = Object.values(fullNames).reduce(sum)
    if (total === 0) return fullNames
    let places = typeof normalize === 'number' ? normalize : 2
    for (const [key, val] of Object.entries(fullNames)) {
      let percentage = (val * 100) / total
      fullNames[key] = roundDecimal(percentage, places) + '%'
    }
  }
  return fullNames
}

const generateMultiples = (amount = 1000, dice = 4, sides = 6) => 
  arrayOf(amount, () => countSides(dice, sides))

const printMultiples = (multiples) =>
  console.log(multiples.sort(), '-', getShortNames(multiples))

const runStatsTest = (
  {
    iters = 1000,
    verbose = false,
    normalize = true,
    dice = 4,
    sides = 6
  } = {}
) => {
  const start = Date.now()
  let results = generateMultiples(iters, dice, sides)
  if (verbose) {
    for (const multiples of results) {
      printMultiples(multiples)
    }
  }
  console.log(`split: ${Date.now() - start}ms`)
  const stats = fullNameStats(results, normalize)
  console.log(`time: ${Date.now() - start}ms`)
  return stats
}

// runStatsTest({ verbose: true })

module.exports = {
  docs: () => print(myself),
  rollDie,
  rollDice,
  countSides,
  getShortNames,
  getFullName,
  fullNameStats,
  generateMultiples,
  printMultiples,
  printMultiples,
  runStatsTest,
}
