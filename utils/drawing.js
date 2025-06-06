const myself = {} // documentation
const { len, print, arrayOf } = require('./general')

myself.draw = "Prints the given string or string array to the console as ASCII art."
const draw = (picture) => {
  console.log([].concat(picture).join('\n'))
  return picture
}
myself.drawRow = "Prints an array of ASCII images side-by-side."
const drawRow = (pictures, padding = 0) => draw(combinePics(pictures, padding))

myself.combinePics = "Combines multiple ASCII images, possibly of different sizes."
const combinePics = (pictures, padding = 0) => {
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

myself.animate = "Animates a sequence of ASCII images or image arrays with the given delay. Multiple sequences with different delays can be given as [{ frames, delay }, ...]."
const animate = (sequence, defaultDelay = 1000) => {
  console.log()
  if (!len(sequence)) return process.stdout.write('> ')
  if (sequence[0].length != null) {
    sequence = [{ frames: sequence, delay: defaultDelay }]
  }
  let { frames, delay } = sequence.shift()
  delay = delay ?? defaultDelay

  let currentFrame = 0
  let intervalId = setInterval(() => {
    if (currentFrame < frames.length) {
      drawRow(frames[currentFrame])
      currentFrame += 1
    }
    else {
      clearInterval(intervalId)
      return animate(sequence, defaultDelay)
    }
  }, delay)
}

module.exports = {
  docs: () => print(myself),
  draw,
  drawRow,
  animate,
  combinePics,
  makeRectangular,
}
