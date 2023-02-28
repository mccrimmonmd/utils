module.exports = {
  randNum: (lessThan) => Math.random() * lessThan,
  randInt: (lessThan) => Math.floor(randNum(lessThan)),
  randDigit: () => randInt(10),
  randDigitString: (length) => {
    let digits = []
    for (let i = 0; i < length; i++) {
      digits.push(randDigit())
    }
    return digits.join('')
  },
  randChoice: (arr) => arr[randInt(arr.length)],
  coinFlip: () => Math.random() < 0.5,
}
