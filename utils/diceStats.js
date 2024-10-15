const myself = {} // documentation
const { print, arrayOf } = require('./general')
const { sum, roundDecimal } = require('./numbers')
const { rollDie, rollDice } = require('./random')

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

const getFullNames = (
  shortNames,
  fullNames = {
    singles: 0,
    dubs: 0,
    trips: 0,
    twoPair: 0,
    quads: 0,
  }
) => {
  const shortNamesArray = Object.keys(shortNames)
  if (shortNamesArray.length === 0) {
    fullNames.singles += 1
    return fullNames
  }
  if (shortNamesArray.includes('5s')) {
    fullNames = {
      fullHouse: 0,
      quints: 0,
      ...fullNames,
    }
  }
  if (shortNamesArray.includes('6s')) {
    fullNames = {
      twoTrips: 0,
      threePair: 0,
      twoAndFour: 0,
      sexts: 0,
      ...fullNames
    }
  }
  for (const [shortName, count] of Object.entries(shortNames)) {
    switch (shortName) {
      case '6s':
        fullNames.sexts += 1
        break
      case '5s':
        fullNames.quints += 1
        break
      case '4s':
        if (shortNamesArray.includes('2s')) fullNames.twoAndFour += 1
        else fullNames.quads += 1
        break
      case '3s':
        if (count === 2) fullNames.twoTrips += 1
        else if (shortNamesArray.includes('2s')) fullNames.fullHouse += 1
        else fullNames.trips += 1
        break
      case '2s':
        if (count === 3) fullNames.threePair += 1
        else if (count === 2) fullNames.twoPair += 1
        else fullNames.dubs += 1
        break
      default:
        console.warn(`unsupported short name ${shortName}; results may not be accurate`)
        fullNames[shortName] = (fullNames[shortName] ?? 0) + 1
    }
  }
  return fullNames
}

const fullNameStats = (results, normalize = false) => {
  let fullNames
  for (const multiples of results) {
    fullNames = getFullNames(getShortNames(multiples), fullNames)
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
  getFullNames,
  fullNameStats,
  generateMultiples,
  printMultiples,
  printMultiples,
  runStatsTest,
}
