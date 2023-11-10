const { stringFrom } = require('./general')

const draw = (picture) => {
  console.log(typeof picture === 'string' ? picture : picture.join('\n'))
  return picture
}
const drawRow = (pictures, padding = 0) => draw(combinePics(pictures, padding))

const combinePics = (pictures, padding = 0) => {
  pictures = pictures.map(makeRectangular)
  let lines = []
  let width = pictures.reduce((lineWidth, pic) => lineWidth + pic[0].length, 0)
  let height = Math.max(...pictures.map(pic => pic.length))
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

const makeRectangular = (picture) => {
  if (typeof picture === 'string') picture = picture.split('\n')
  if (picture == null || picture.length === 0) {
    return ['']
  }
  picture = picture.map(line => line ?? '')
  let maxLength = Math.max(...picture.map(line => line.length))
  return picture.map(line => line + stringFrom(maxLength - line.length, ' '))
}

module.exports = {
  draw,
  drawRow,
  combinePics,
  makeRectangular,
}
