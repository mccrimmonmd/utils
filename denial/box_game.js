const {
  arrayify: repeat,
  objects: { initializeFromOptions },
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

const BOX_WIDTH = 6
const FULL_WIDTH = BOX_WIDTH * 3 - 1

const max = (a, b) => a === b ? coinFlip() : a > b
const min = (a, b) => a === b ? coinFlip() : a < b
const maxOrNew = (a, b) =>
  a === b ? coinFlip() : a === 0 || (b !== 0 && a > b)
const maxOrOpposite = (a, b, rivalChoice = null) =>
  rivalChoice != null ?
    rivalChoice ? b : a
  : max(a, b)

const Square = class {
  constructor() {
    this.dots = 0
    this.fresh = false
  }
  poke() {
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
  constructor(
    {
      size = 12,
      pokeStrat = max,
      useStrat = min,
      choosesFirst = 'none',
      showContents = _debug,
    } = {}
  ) {
    this.contents = repeat(() => new Square(), size)
    initializeFromOptions(
      this,
      { pokeStrat, useStrat, choosesFirst, showContents }
    )
  }

  renderChoice(left, right, usedLeft, pokedLeft) {
    let putBack
    const leftPic = left.getRender()
    if (right != null) {
      const rightPic = right.getRender()
      console.log(leftPic, rightPic)
      putBack = usedLeft ? rightPic : leftPic
    }
    else {
      console.log(leftPic)
      putBack = ' '.repeat(2)
    }
    const blank = ' '.repeat(putBack.length)
    console.log()
    console.log('\\', blank,   '/')
    console.log('|',  putBack, '|')
    console.log('|',  blank,   '|')
    if (this.showContents) this.renderContents
  }

  renderContents() {
    const asStrings = repeat(
      (i) => {
        const row = this.contents.slice(BOX_WIDTH * i, BOX_WIDTH * (i + 1))
        const string = row.map((square) => square?.getRender() ?? '').join(' ')
        const padding = FULL_WIDTH - string.length
        return string + ' '.repeat(Math.max(padding, 0))
      },
      Math.ceil(this.contents.length / BOX_WIDTH)
    )
    const render = drawing.makeRectangular(asStrings) // is this even necessary?
    const width = Math.max(render[0].length, FULL_WIDTH) // surely not both of these??
    console.log(' ' + '_'.repeat(width + 2))
    for (const line of render) {
      console.log('|', line, '|')
    }
    console.log(' ' + '_'.repeat(width + 2))
    console.log()
  }

  makeChoice(choosesFirst = this.choosesFirst) {
    if (this.contents.length === 0) {
      // print literally none?? lol
      // printBox(contents)
      console.log()
      console.log(ending)
      return
    }
    if (this.contents.length === 1) {
      // OR: let 'none' be option here??
      // (dots = Infinity?)
      const last = this.contents.pop()
      last.poke()
      this.renderChoice(last)
      return
    }
    const left = randRemove(this.contents)
    const right = randRemove(this.contents)
    let pokedLeft
    let usedLeft
    if (choosesFirst === 'poke') {
      pokedLeft = this.pokeStrat(left.dots, right.dots)
      (pokedLeft ? left : right).poke()
    }
    usedLeft = this.useStrat(
      left.dots,
      right.dots,
      pokedLeft
    )
    if (choosesFirst !== 'poke') {
      pokedLeft = this.pokeStrat(
        left.dots,
        right.dots,
        choosesFirst === 'use' ? usedLeft : null
      )
      (pokedLeft ? left : right).poke()
    }
    this.renderChoice(left, right, usedLeft, pokedLeft)
    // this.contents.push(unused) would be simpler, but it's more
    // fun visually to put it back in a random spot. If it turns
    // out to be a performance issue (why would it???), I'll add
    // a check to use push unless this.showContents is true.
    this.contents.splice(
      randInt(this.contents.length),
      0,
      usedLeft ? right : left
    )

/*

const choose = (strat) => (a, b) => {
  return strat(a, b) ? [0, 1] : [1, 0]
}

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
    let { BOX_WIDTH, FULL_WIDTH, boxLength } = getDimensions(size)
    let boxStrings = repeat(
      (_, i) => {
        let row = contents.slice(BOX_WIDTH * i, BOX_WIDTH * (i + 1))
        let string = row.map(num => getPic(num) ?? '').join(' ')
        let padding = FULL_WIDTH - string.length
        return string + ' '.repeat(padding > 0 ? padding : 0)
      },
      boxLength
    )
    boxStrings = drawing.makeRectangular(boxStrings)
    FULL_WIDTH = Math.max(boxStrings[0].length, FULL_WIDTH)
    console.log('', '_'.repeat(FULL_WIDTH + 2))
    for (const boxString of boxStrings) {
      console.log('|', boxString, '|')
    }
    console.log('', '-'.repeat(FULL_WIDTH + 2))
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

const openNewBox = (size = 12, choosePoke = max, chooseUse = min) => {
  let contents = repeat(0, size)
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

/* -------------------------- */

const useUpTheBox = (box = new Box()) => {
  while (box.contents.length) {
    box.makeChoice()
  }
  return box
}

const quickOptions = {
  choosesFirst: 'use',
  showContents: true
}

const isModule = require.main !== module
if (!isModule) {
  useUpTheBox(new Box(quickOptions))
}

module.exports = {
  Box,
  strats: {
    max,
    min,
    maxOrNew,
    maxOrOpposite,
    coinFlip,
  },
  useUpTheBox,
} // = require('./box_game')
