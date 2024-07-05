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
  // const dupes = []
  while (days > 0) {
    totalDays += 1
    days -= 1
    
    let dupeType = 0
    const results = rollDice(4)
    // for (let i = 0; i < 6; i++) dupes[i] = 0
    // for (const die of results) {
      // dupes[die - 1]++
    // }
    // for (const dupe of dupes) {
      // if (dupe > dupeType && dupe > 1) {
        // if (dupeType === 2 && dupe === 2) dupeType = 1
      // if (dupe !== 0 && dupe !== 1) {
        // if (dupeType === 2) {
          // if (dupe === 2) dupeType = 1
        // }
        // else dupeType = dupe
      // }
    // }
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
