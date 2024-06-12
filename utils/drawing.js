const myself = {} // documentation
const { arrayOf } = require('./general')

myself.draw = "Prints the given string or string array to the console as ASCII art."
const draw = (picture) => {
  console.log(typeof picture === 'string' ? picture : picture.join('\n'))
  return picture
}
myself.drawRow = "Prints an array of ASCII images side-by-side."
const drawRow = (pictures, padding=0) => draw(combinePics(pictures, padding))

myself.animate = "Animates a sequence of ASCII images or image arrays with the given delay. Multiple sequences with different delays can be given as [{ frames, delay } ...]."
const animate = (frames, interval=1000, moreAnimations=[]) => {
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
const animateInSequence = (animations) => {
  if (!animations?.length) return
  let { frames, interval } = animations.shift()
  animate(frames, interval, animations)
}

myself.combinePics = "Combines multiple ASCII images, possibly of different sizes."
const combinePics = (pictures, padding=0) => {
  if (typeof pictures === 'string') return pictures
  pictures = pictures.map(makeRectangular)
  let height = Math.max(...pictures.map(pic => pic.length))
  
  let lines = arrayOf(height, [])
  for (const pic of pictures) {
    let i = 0
    for (; i < pic.length; i++) {
      lines[i].push(pic[i], ' '.repeat(padding))
    }
    for (; i < height; i++) {
      lines[i].push(' '.repeat(pic[0].length + padding))
    }
  }
  return lines.map(line => line.join(''))
}

myself.makeRectangular = "Pads an array of strings so all rows are the same length."
const makeRectangular = (picture) => {
  if (typeof picture === 'string') picture = picture.split('\n')
  if (picture == null || picture.length === 0) {
    return ['']
  }
  picture = picture.map(line => line ?? '')
  let maxLength = Math.max(...picture.map(line => line.length))
  return picture.map(line => line + ' '.repeat(maxLength - line.length))
}

module.exports = {
  docs: myself,
  draw,
  drawRow,
  animate,
  combinePics,
  makeRectangular,
}
