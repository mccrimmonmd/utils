const dice = require('./diceStats')
const { range, zip } = require('/.general')

const play = () => {
  const stats = {}
  const modifiers = [ 0,   0,   0,   0,   0 ]
  const ruleNames = ['v', 'w', 'x', 'y', 'z']
  console.log('START!')
  for (const round of range(Infinity)) {
    // before the round
    const rolls = dice.rollDice(5)
    const highRules = rolls.reduce((highs, roll, i) => {
      if (roll >= 10) highs.push(ruleNames[i])
      return highs
    }, [])
    if (highRules.length > 0) {
      stats.something = 'something'
      console.log(`Reset chance! Rules: ${highRules.length < 5 ? highRules : 'all!'}`)  
    }
    // multiples
    const multipleType = dice.getFullName(rolls)
    // other modifiers?
    const finalRolls = rolls.map((roll, i) => roll + modifiers[i])
    // during the round
    console.log(`Starting round ${round}...`)
    // end of the round
    console.log(`...end round ${round}! Testing against:`)
    console.dir(Object.fromEntries(zip(ruleNames, finalRolls)))
    for (const [i, roll] of rolls.entries()) {
      if (roll === 6) modifiers[i] += 1
    }
  }
}

module.exports = {
  play,
}
