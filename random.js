module.exports = {
  randNum: (lessThan) => Math.random() * lessThan,
  randInt: (lessThan) => Math.floor(randNum(lessThan)),
  randDigit: () => randInt(10),
  randDigitString: (length) => {
    return new Array(length).map(_ => randDigit()).join('')
    // let digits = []
    // for (let i = 0; i < length; i++) {
    //   digits[i] = randDigit()
    // }
    // return digits.join('')
  },
  randChoice: (arr) => arr[randInt(arr.length)],
  shuffled: (arr) => {
    arr = arr.slice()
    for (let i = arr.length; i > 1; i--) {
      let place = randInt(i)
      [arr[place], arr[i - 1]] = [arr[i - 1], arr[place]]
    }
    return arr
  },
  coinFlip: () => Math.random() < 0.5,
}
