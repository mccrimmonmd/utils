const {
  arrayify: replicate,
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
const sep = '=> '
const sep2 = ' {'

const boxWidth = 6
const fullWidth = boxWidth * 3 - 1

const max = (a, b) => a >= b
const min = (a, b) => a <= b
const maxNoZeroes = (a, b) => a === 0 || (b !== 0 && a >= b)
const choose = (strat) => (a, b) => {
  return strat(a, b) ? [0, 1] : [1, 0]
}

const Square = class {
  constructor(dots = 0) {
    this.dots = dots
    this.fresh = false
  }
  newDot() {
    this.dots += howMany
    this.fresh = true
  }
  getRender() {
    const num = this.dots
    if (this.fresh && num > 0) num = num - 1
    const oldDots = ':'.repeat(Math.trunc(num / 2)) + num % 2 === 0 ? '' : '.'
    const render = `[${oldDots}${this.fresh ? '*' : ''}]`
    this.fresh = false
    return render
  }
}

const Box = class {
  static 
  static 

  constructor(
    {
      size = 12,
      pokeStrat = max,
      useStrat = min,
      showContents = _debug,
    } = {}
  ) {
    this.contents = replicate(() => new Square(), size)
    this.poke = pokeStrat
    this.use = useStrat
    this.showContents = showContents
  }

  renderChoice() {
    // 'print' goes here...
    const render = putBack?.getRender() ?? '  '
    console.log()
    console.log('\\', ' '.repeat(render.length), '/')
    console.log('|', render, '|')
    console.log('|', ' '.repeat(render.length), '|')
    if (this.showContents) this.renderContents
  }

  renderContents() {
    let render = replicate(
      (i) => {
        const row = this.contents.slice(boxWidth * i, boxWidth * (i + 1))
        const string = row.map(square => square.getRender() ?? '').join(' ')
        const padding = fullWidth - string.length
        return string + ' '.repeat(padding > 0 ? padding : 0)
      },
      Math.ceil(this.contents.length / boxWidth)
    )
    render = drawing.makeRectangular(render)
    const width = Math.max(render[0].length, fullWidth)
    console.log('', '_'.repeat(width + 2))
    for (const boxString of render) {
      console.log('|', boxString, '|')
    }
    console.log('', '-'.repeat(width + 2))
    console.log()
  }

  makeChoice() {
    if (this.contents.length === 0) {
      // print literally none?? lol
      // printBox(contents)
      console.log()
      console.log(ending)
      return
    }
    if (this.contents.length === 1) {
      const last = this.contents[0]
      print({ left: last })
      this.contents.pop()
      print(
        { left: last + 1, pokedLeft: true, usedLeft: true },
        this.contents,
        this.showContents
      )
      return
    }
    const left = randRemove(this.contents)
    const right = randRemove(this.contents)
    const options = { left, right }
    print(options)
    const pokedLeft = this.poke(left.dots, right.dots) 
    const usedLeft = this.use(left.dots, right.dots)
    options[pokedLeft ? 'left' : 'right'].newDot()
    this.contents.splice(
      randInt(this.contents.length),
      0,
      options[usedLeft ? 'left' : 'right']
    )
    print({ left, right, pokedLeft, usedLeft }, this.contents, this.showContents)
  }
}

/* -------------------------- */

const renderBox = (contents, unused, size = contents.length) => {
  // let strArr = []
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
    let boxStrings = replicate(
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
  // return strArr.join('\n')
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
  // console.log()
  // console.log(sep + used) // + ('~o' * '.') + sep2 (or reverse/mixed order)
  renderBox(contents, options[indexes.unused], size)
}

const openNewBox = (size = 12, pokeStrat = max, useStrat = min) => {
  let choosePoke = choose(pokeStrat)
  let chooseUse = choose(useStrat)
  let contents = replicate(0, size)
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

const isModule = require.main !== module
if (!isModule) useUpTheBox()

module.exports = {
  useUpTheBox,
  openNewBox,
  strats: {
    max,
    min,
    maxNoZeroes,
    coinFlip,
  },
} // = require('./box_game')
