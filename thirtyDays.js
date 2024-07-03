const utils = require('./utils')
const { rollDice } = utils.random

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
    
    var score = 2
    var results = rollDice(4)
    var dupes = utils.findDupes(results)
    var dupeType
    if (dupes.length === 0) dupeType = 0
    else {
      if (dupes.length === 2) {
        dupeType = 1
      }
      else {
        dupeType = [dupes[0].length]
      }
    }
    if (dupeType === 1){
      score += 5
      days += 2
    }
    else if (dupeType === 3) score += 1
    else if (dupeType === 4) {
      score += 15
      days += 15
    }
    for (const die of results) score += die >= 4 ? 1 : 0
    totals[dupeType] += 1
    totalScore += score
    if (!silent) {
      var name = names[dupeType]
      console.log(results, `(${score} points)`, name && ` - ${name}!`)
    }
  }
  return {
    none: totals[0],
    pairs: totals[1],
    doubles: totals[2],
    triples: totals[3],
    perfects: totals[4],
    totalScore,
    totalDays,
  }
}
