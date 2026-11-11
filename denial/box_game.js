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

const _debug = false
const ending = '-> '.repeat(3) + '()'
const sep = '=>'
const sep2 = ' ->'
const sep3 = '{'

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
    this.dots += 1
    this.fresh = true
  }
  getRender() {
    const num =
      this.fresh && this.dots > 0 ?
        this.dots - 1
      : this.dots
    const evenDots = ':'.repeat(Math.trunc(num / 2))
    const oddDot = num % 2 === 0 ? '' : '.'
    const render = `[${evenDots}${oddDot}${this.fresh ? '*' : ''}]`
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
    let used
    let putBack
    const leftPic = left.getRender()
    if (right != null) {
      const rightPic = right.getRender()
      console.log(leftPic, rightPic)
      ;[used, putBack] =
        usedLeft ?
          [left.getRender(), right.getRender()]
        : [right.getRender(), left.getRender()]
    }
    else {
      console.log(leftPic)
      ;[used, putBack] = [left.getRender(), ' '.repeat(2)]
    }
    console.log()

    console.log(sep, used, /* sep2.repeat(used.dots), sep3 */)
    console.log()

    const blank = ' '.repeat(putBack.length)
    console.log('\\', blank,   '/')
    console.log('|',  putBack, '|')
    console.log('|',  blank,   '|')
    console.log()
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
    console.log('|' + '_'.repeat(width + 2) + '|')
    console.log()
  }

  makeChoice(choosesFirst = this.choosesFirst) {
    if (this.contents.length === 0) {
      console.assert(false, 'This branch never runs, does it? (Unless you try to make a choice from an already-empty box?)')
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
      console.log(ending)
      console.log()
      return
    }
    const left = randRemove(this.contents)
    const right = randRemove(this.contents)
    let pokedLeft
    let usedLeft
    if (choosesFirst === 'poke') {
      pokedLeft = this.pokeStrat(left.dots, right.dots)
      ;(pokedLeft ? left : right).poke()
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
      ;(pokedLeft ? left : right).poke()
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
    if (this.showContents) this.renderContents()
  }
}

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
