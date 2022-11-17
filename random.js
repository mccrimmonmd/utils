randNum = (lessThan) => Math.random() * lessThan
randInt = (lessThan) => Math.floor(randNum(lessThan))
randChoice = (arr) => arr[randInt(arr.length)]
coinFlip = () => Math.random() < 0.5

module.exports = {
  randNum,
  randInt,
  randChoice,
  coinFlip,
}
