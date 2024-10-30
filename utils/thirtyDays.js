const { range, findDupes } = require('./general')
const { sum, roundDecimal } = require('./numbers')
const { rollDice } = require('./random')

const playGame = (rounds = 6, days = 30, options = {}) => {
  options = {
    verbose: false,
    ...options
  }
  if (rounds < 1) rounds = 1
  const averagePerRound = {
    singles: 0,
    doubles: 0,
    triples: 0,
    pairs: 0,
    perfects: 0,
    totalScore: 0,
    totalDays: 0,
  }
  const variation = {
    singles: [],
    doubles: [],
    triples: [],
    pairs: [],
    perfects: [],
    totalScore: [],
    totalDays: [],
  }
  
  const start = Date.now()
  for (const _ of range(rounds)) {
    const results = playRound(days, options)
    for (const [key, value] of Object.entries(results)) {
      variation[key][0] = Math.min(value, variation[key][0] ?? Infinity)
      variation[key][1] = Math.max(value, variation[key][1] ?? -Infinity)
      averagePerRound[key] += value
    }
  }
  console.log(`time: ${Date.now() - start}ms`)
  for (const [key, value] of Object.entries(averagePerRound)) {
    averagePerRound[key] = roundDecimal(value / rounds, 5)
  }
  
  return {
    averagePerRound,
    variation,
  }
}

const playRound = (
  days = 30,
  options = {},
) => {
  options = {
    verbose: true,
    players: 2,
    dice: 4,
    baseScore: 2,
    highDie: 5,
    highDieScore: 1,
    singlesScore: 0,
    tripScore: 1,
    pairScore: 4,
    pairDays: 2,
    perfectScore: 7,
    perfectDays: 7,
    ...options
  }
  const totals = [
    0,
    0,
    0,
    0,
    0,
  ]
  const names = [
    '',
    'Two Pair',
    'Double',
    'Triple',
    'Perfect Roll'
  ]
  const findDupeTypes = (dupeSets) => {
    const dupeTypes = []
    for (const [i, dupes] of dupeSets.entries()) {
      dupeTypes[i] = 0
      if (dupes.length > 0) {
        if (dupes.length === 2) {
          dupeTypes[i] = 1
        }
        else {
          dupeTypes[i] = dupes[0].length
        }
      }
    }
    return dupeTypes
  }
  let totalScore = 0
  let totalDays = 0
  while (days > 0) {
    totalDays += 1
    days -= 1
    
    const resultSets = []
    const dupeSets = []
    for (const player of range(options.players)) {
      resultSets[player] = rollDice(options.dice)
      dupeSets[player] = findDupes(resultSets[player])
    }
    const dupeTypes = findDupeTypes(dupeSets)
    
    const scores = []
    for (const [i, dupeType] of dupeTypes.entries()) {
      let score = options.baseScore
      if (dupeType === 0) score += options.singlesScore
      else if (dupeType === 1) {
        score += options.pairScore
        days += options.pairDays
      }
      else if (dupeType === 3) score += options.tripScore
      else if (dupeType === 4) {
        score += options.perfectScore
        days += options.perfectDays
      }
      totals[dupeType] += 1
      score += resultSets[i].filter(die => die >= options.highDie)
        .length * options.highDieScore
      scores[i] = score
    }
    const combinedScore = scores.reduce(sum)
    totalScore += combinedScore
    if (options.verbose) {
      console.log(`**Day ${totalDays}**`)
      for (const i of range(options.players)) {
        var name = names[dupeTypes[i]]
        console.log(`- ${resultSets[i]} (${scores[i]} points)`, name && ` - ${name}!`)
      }
      console.log(`Combined score: ${combinedScore}`)
    }
  }
  return {
    singles: totals[0],
    doubles: totals[2],
    triples: totals[3],
    pairs: totals[1],
    perfects: totals[4],
    totalScore,
    totalDays,
  }
}

module.exports = {
  round: playRound,
  game: playGame,
}
