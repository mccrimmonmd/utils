const {
  arrayify,
  random: {
    coinFlip,
    randNum,
    randInt,
    randRemove,
  },
  drawing,
} = require('../utils')

const _debug = true
const ending = '-> '.repeat(3) + '()'
const sep = '+'
const sep2 = ' ==='

const max = (a, b) => a >= b
const min = (a, b) => a <= b
const choose = (strat) => (a, b) => {
  return strat(a, b) ? [0, 1] : [1, 0]
}

const getPic = (num, isNew = false) => {
  if (num == null) return null
  if (isNew) num = num > 0 ? num - 1 : 0
  let colons = ':'.repeat(Math.trunc(num / 2))
  return `[${colons}${num % 2 === 0 ? '' : '.'}${isNew ? '*' : ''}]`
}

const getDimensions = (size) => {
  let boxWidth = 6
  let fullWidth = boxWidth * 3 - 1
  let boxLength = Math.ceil(size / boxWidth)
  return { boxWidth, fullWidth, boxLength }
}

const printBox = (contents, unused, size) => {
  console.log(renderBox(contents, unused, size))
}
const renderBox = (contents, unused, size = contents.length) => {
  let strArr = []
  let boxString = getPic(unused) ?? '  '
  // strArr.push(`\n\\ ${' '.repeat(boxString.length)} /`)
  console.log()
  console.log('\\', ' '.repeat(boxString.length), '/')
  // strArr.push(`| ${boxString} |`)
  console.log('|', boxString, '|')
  // strArr.push(`| ${' '.repeat(boxString.length)} |`)
  console.log('|', ' '.repeat(boxString.length), '|')
  if (contents?.show) {
    let { boxWidth, fullWidth, boxLength } = getDimensions(size)
    let boxStrings = arrayify(
      (_, i) => {
        let row = contents.slice(boxWidth * i, boxWidth * (i + 1))
        let string = row.map(num => getPic(num) ?? '').join(' ')
        let padding = fullWidth - string.length
        return string + ' '.repeat(padding > 0 ? padding : 0)
      },
      boxLength
    )
    boxStrings = drawing.makeRectangular(boxStrings)
    fullWidth = Math.max(boxStrings[0].length, fullWidth)
    console.log('', '_'.repeat(fullWidth + 2))
    for (const boxString of boxStrings) {
      console.log('|', boxString, '|')
    }
    console.log('', '-'.repeat(fullWidth + 2))
    console.log()
  }
  return strArr.join('\n')
}

const print = (options, indexes, contents, size) => {
  let logEm = (left, right) => {
    if (right == null) {
      console.log(left)
    }
    else {
      console.log(left, right)
    }
  }
  
  let [left, right] = options
  leftPic = getPic(left, indexes.poked === 0)
  rightPic = getPic(right, indexes.poked === 1)
  logEm(leftPic, rightPic)
  if (indexes.used == null) return
  let used = getPic(options[indexes.used])
  // drawing.drawRow([
  // `\n${sep + used}\n`,
  // renderBox(contents, options[indexes.unused], size)
  // ], 5)
  console.log()
  console.log(sep + used) // + ('~o' * '.') + sep2 (or reverse/mixed order)
  renderBox(contents, options[indexes.unused], size)
}

const openNewBox = (size = 12, pokeStrat = max, useStrat = min) => {
  let choosePoke = choose(pokeStrat)
  let chooseUse = choose(useStrat)
  let contents = arrayify(0, size)
  contents.show = _debug
  return {
    makeChoice: () => {
      if (contents.length === 0) {
        // print literally none?? lol
        // printBox(contents)
        console.log()
        console.log(ending)
        return
      }
      if (contents.length === 1) {
        let last = contents[0]
        print([last], {})
        contents.pop()
        print([last + 1], { used: 0, poked: 0 }, contents, size)
        return
      }
      let optionA = randRemove(contents)
      let optionB = randRemove(contents)
      let options = [ optionA, optionB ]
      print(options, {})
      let [poked, unpoked] = choosePoke(...options)
      options[poked]++
      let [used, unused] = chooseUse(...options)
      contents.splice(randInt(contents.length), 0, options[unused])
      print(options, { poked, unpoked, used, unused }, contents, size)
    },
    contents,
  }
}

const useUpTheBox = (box = openNewBox()) => {
  box.contents.show = true
  while (box.contents.length) {
    box.makeChoice()
  }
  console.log(ending)
  return box
}

useUpTheBox()

module.exports = {
  useUpTheBox,
  openNewBox,
  strats: {
    max,
    min,
    coinFlip,
  },
} // = require('./box_game')
