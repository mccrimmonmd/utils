const { arrayOf, stringOf } = require('./general')

const draw = (picture) => {
  console.log(typeof picture === 'string' ? picture : picture.join('\n'))
  return picture
}
const drawRow = (pictures, padding = 0) => draw(combinePics(pictures, padding))

const animate = (frames, interval = 1000, moreAnimations = []) => {
  let currentFrame = 0
  let intervalId = setInterval(() => {
    if (currentFrame === 0) console.log()
    if (currentFrame >= frames.length) {
      clearInterval(intervalId)
      if (moreAnimations.length) {
        return animateInSequence(moreAnimations)
      }
      else {
        return process.stdout.write('> ')
      }
    }
    drawRow(frames[currentFrame])
    currentFrame += 1
  }, interval)
}
const animateInSequence(animations) => {
  if (!animations?.length) return
  let { frames, interval } = animations.shift()
  animate(frames, interval, animations)
}

const combinePics = (pictures, padding = 0) => {
  if (typeof pictures === 'string') return pictures
  pictures = pictures.map(makeRectangular)
  let width = pictures.reduce((lineWidth, pic) => lineWidth + pic[0].length)
  let height = Math.max(...pictures.map(pic => pic.length))
  
  let lines = arrayOf(height, [])
  pictures.forEach(pic => {
    let i = 0
    for (; i < pic.length; i++) {
      lines[i].push(pic[i] + stringOf(padding, ' '))
    }
    for (; i < height; i++) {
      lines[i].push(stringOf(pic[0].length + padding, ' '))
    }
  })
  return lines.map(line => line.join(''))
}

const makeRectangular = (picture) => {
  if (typeof picture === 'string') picture = picture.split('\n')
  if (picture == null || picture.length === 0) {
    return ['']
  }
  picture = picture.map(line => line ?? '')
  let maxLength = Math.max(...picture.map(line => line.length))
  return picture.map(line => line + stringOf(maxLength - line.length, ' '))
}

module.exports = {
  draw,
  drawRow,
  animate,
  combinePics,
  makeRectangular,
}
