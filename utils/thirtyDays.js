const { range, timeIt, findDupes } = require('./general')
const { roundDecimal, arithmeticMean } = require('./numbers')
const { rollDice } = require('./random')
const { sum } = require('./reducers')

const playGame = (rounds = 6, days = 30, options = {}) => {
  options = {
    verbose: false,
    ...options
  }
  if (rounds < 1) rounds = 1

  const names = [
    'singles',
    'doubles',
    'triples',
    'pairs',
    'perfects',
    'totalScore',
    'totalDays',
  ]
  const stats = Object.fromEntries(
    names.map(name => [ name, {
      min: Infinity,
      max: -Infinity,
      avg: []
    } ])
  )
  // const averagePerRound = initObject()
  // const variation  = initObject()
  
  timeIt(() => {
    for (const _ of range(rounds)) {
      const results = playRound(days, options)
      for (const [key, value] of Object.entries(results)) {
        stats[key].avg.push(value)
        stats[key].min = Math.min(value, stats[key].min)
        stats[key].max = Math.max(value, stats[key].max)
      }
    }
  })
  for (const [key, values] of Object.entries(stats)) {
    stats[key].avg = roundDecimal(arithmeticMean(values), 5)
  }
  
  return stats
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
    pairDays: 1,
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
        const name = names[dupeTypes[i]]
        console.log(`- ${resultSets[i]} (${scores[i]} points)`, name && `- ${name}!`)
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
