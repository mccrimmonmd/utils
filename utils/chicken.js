const dice = require('./diceStats')
const { range, zip, arrayOf, last } = require('/.general')

const multipleNames = [
  'dubs',
  'two pair',
  'trips',
  'singles',
  'full house',
  'quads',
  'quints'
]
 
const ruleNames = ['v', 'w', 'x', 'y', 'z']

const multipleLevels = multipleNames.reduce((names, name, i) => {
  names[name] = i
  return names
}, {})

const applyModifiers = (rolls, modifiers) => {
  const levels = rolls.map((roll, i) => roll + modifiers[i])
  const [ tens, elevens, twelves ] = levels.reduce((highs, level) => {
    if (level >= 10) highs[0] += 1
    if (level === 11) highs[1] += 1
    if (level >= 12) highs[2] += 1
    return highs
  }, [0, 0, 0])
  if (tens > 0) {
    // update stats
    if (firstTen) {
      console.log('First ten!')
      // update stats
      firstTen = false
    }
    // special rules
    console.log(`Tens: ${tens}`)
  }
  if (twelves > 0) {
    // update stats
    if (firstTwelve) {
      console.log('First twelve!')
      // update stats
      firstTwelve = false
    }
    console.log(`Twelves: ${twelves}`)
  }
  return [ levels, tens, elevens, twelves ]
}

const stats = {}
const play = (maxRounds = Infinity, totalScore = 0, modifiers = arrayOf(5, 0)) => {
  let locked = arrayOf(5, false)
  let firstTen = true
  let firstTwelve = true
  let lockTwelves = false
  let skipTests = 0 // 0 = none, 1 = quads, 2 = quints
  let endgame = 0 // 0 = none, 1 = any tens, 2 = three tens, 3 = four tens & any twelves, 4 = all twelves
  console.log('START!')
  for (const round of range(maxRounds)) {
    // before the round
    let score = 1
    const rolls = dice.rollDice(5)
    const multipleType = dice.getFullName(rolls)
    let [ levels, tens, elevens, twelves ] = applyModifiers(rolls, modifiers)
    // adjust multiple
    // apply multiple
    // apply z
    // other modifiers?
    score += elevens
    score += twelves * 2
    if (lockTwelves) locked = levels. map(level => level >= 12)
    // during the round
    console.log(`Starting round ${round}...`)
    // end of the round
    console.log(`...end round ${round}! Testing against:`)
    console.dir(Object.fromEntries(zip(ruleNames, levels)))
    // TODO: calculate chance of losing (optional): return false
    totalScore += score
    // TODO: simulate reset / end game decisions (or ask user): return totalScore / return play(maxRounds - round - 1[, totalScore, modifiers])
    for (const [i, roll] of rolls.entries()) {
      if (roll === 6) modifiers[i] += 1
    }
  }
}

module.exports = {
  play,
}
