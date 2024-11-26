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

const play = (maxRounds = Infinity, totalScore = 0) => {
  const stats = {}
  const modifiers = arrayOf(5, 0)
  let locked = arrayOf(5, false)
  let firstTen = true
  let firstTwelve = true
  let lockTwelves = false
  console.log('START!')
  for (const round of range(maxRounds)) {
    // before the round
    let score = 1
    const rolls = dice.rollDice(5)
    const levels = rolls.map((roll, i) => roll + modifiers[i])
    const multipleType = dice.getFullName(rolls)
    const [ tens, elevens, twelves ] = levels.reduce((highs, level) => {
      if (level >= 10) highs[0] += 1
      if (level === 11) highs[1] += 1
      if (level >= 12) highs[2] += 1
      return highs
    }, [0, 0, 0])
    score += elevens
    score += twelves * 2
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
      if (lockTwelves) locked = levels. map(level => level >= 12)
      console.log(`Twelves: ${twelves}`)
    }
    // adjust multiple
    // apply multiple
    // apply z
    // other modifiers?
    // during the round
    console.log(`Starting round ${round}...`)
    // end of the round
    console.log(`...end round ${round}! Testing against:`)
    console.dir(Object.fromEntries(zip(ruleNames, levels)))
    // TODO: calculate chance of losing (optional): return false
    totalScore += score
    // TODO: simulate reset / end game decisions (or ask user): return totalScore / return play(maxRounds - round - 1[, totalScore])
    for (const [i, roll] of rolls.entries()) {
      if (roll === 6) modifiers[i] += 1
    }
  }
}

module.exports = {
  play,
}
