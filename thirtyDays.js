const utils = require('./utils')
const { rollDice } = utils.random

const runAverage = (rounds, days=30) => {
  const averagePerRound = {
    singles: 0,
    doubles: 0,
    triples: 0,
    pairs: 0,
    perfects: 0,
    combinedScore: 0,
    totalDays: 0,
  }
  const variation = {
    singles: [],
    doubles: [],
    triples: [],
    pairs: [],
    perfects: [],
    combinedScore: [],
    totalDays: [],
  }
  
  const start = Date.now()
  for (const round of utils.range(rounds)) {
    const results = playDice(days, true)
    for (let [key, value] of Object.entries(results)) {
      if (key === 'totalScore') {
        key = 'combinedScore'
        value *= 2
      }
      variation[key][0] = Math.min(value, variation[key][0] ?? Infinity)
      variation[key][1] = Math.max(value, variation[key][1] ?? -Infinity)
      averagePerRound[key] += value
    }
  }
  console.log(`time: ${Date.now() - start}ms`)
  for (const [key, value] of Object.entries(averagePerRound)) {
    averagePerRound[key] = utils.roundDecimal(value / rounds, 5)
  }
  
  return {
    averagePerRound,
    variation,
  }
}

const playDice = (days, silent=false) => {
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
  let totalScore = 0
  let totalDays = 0
  while (days > 0) {
    totalDays += 1
    days -= 1
    
    let dupeType = 0
    const results = rollDice(4)
    const dupes = utils.findDupes(results)
    if (dupes.length === 0) dupeType = 0
    else {
      if (dupes.length === 2) {
        dupeType = 1
      }
      else {
        dupeType = dupes[0].length
      }
    }
    
    let score = 1
    if (dupeType === 1) {
      score += 5
      days += 2
    }
    else if (dupeType === 3) score += 1
    else if (dupeType === 4) {
      score += 15
      days += 7
    }
    for (const die of results) score += die >= 5 ? 1 : 0
    totals[dupeType] += 1
    totalScore += score
    if (!silent) {
      var name = names[dupeType]
      console.log(results, `(${score} points)`, name && ` - ${name}!`)
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

playDice(30)
