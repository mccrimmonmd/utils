const dice = require('./diceStats')
const { range, zip } = require('/.general')

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

const play = (maxRounds = Infinity) => {
  const stats = {}
  const modifiers = [ 0,   0,   0,   0,   0 ]
  let firstTen = true
  let firstTwelve = true
  console.log('START!')
  for (const round of range(maxRounds)) {
    // before the round
    const rolls = dice.rollDice(5)
    const levels = rolls.map((roll, i) => roll + modifiers[i])
    const multipleType = dice.getFullName(rolls)
    const [ tens, twelves ] = levels.reduce((highs, level) => {
      if (level >= 10) highs[0] += 1
      if (level === 12) highs[1] += 1
      return highs
    }, [0, 0])
    if (tens > 0) {
      // update stats
      if (firstTen) {
        console.log('First ten!')
        // update stats
        firstTen = false
      }
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
    // adjust multiple
    // apply multiple
    let score = 1 // unless trips+
    // apply z
    // other modifiers?
    // during the round
    console.log(`Starting round ${round}...`)
    // end of the round
    console.log(`...end round ${round}! Testing against:`)
    console.dir(Object.fromEntries(zip(ruleNames, levels)))
    score += levels.reduce((bonus, level) => bonus + (level > 10 ? level - 10 : 0)) 
    for (const [i, roll] of rolls.entries()) {
      if (roll === 6) modifiers[i] += 1
    }
  }
}

module.exports = {
  play,
}
