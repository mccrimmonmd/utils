const { arrayFrom, stringFrom } = require('./general')

const draw = (picture) => {
  console.log(picture.join('\n'))
  return picture
}
const drawRow = (pictures, padding = 0) => draw(combinePics(pictures, padding))

const combinePics = (pictures, padding = 0) => {
  pictures = pictures.map(makeRectangular)
  let lines = []
  let width = pictures.reduce((lineWidth, pic) => lineWidth + pic[0].length, 0)
  let height = pictures.reduce((maxHeight, pic) => {
    return maxHeight < pic.length ? pic.length : maxHeight
  }, 0)
  for (let i = 0; i < height; i++) {
    let line = []
    for (let j = 0; j < pictures.length; j++) {
      let pic = pictures[j]
      let str = pic.length < i + 1 ? stringFrom(pic[0].length, ' ') : pic[i]
      line.push(str)
      if (padding) line.push(stringFrom(padding, ' '))
    }
    lines.push(line.join(''))
  }
  return lines
}

const makeRectangular = (pic) => {
  if (!Array.isArray(pic)) pic = pic.split('\n')
  if (pic == null || pic.length === 0) {
    return ['']
  }
  pic = pic.map(line => line == null ? '' : line)
  let maxLength = pic.reduce(
    (len, line) => len < line.length ? line.length : len,
    0
  )
  return pic.map(line => line + stringFrom(maxLength - line.length, ' '))
}

module.exports = {
  draw,
  drawRow,
  combinePics,
  makeRectangular,
}
