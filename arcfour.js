const {
  range,
  enumerate,
  arrayify,
  swap,
  random: {
    randInt
  },
  op,
} = require('C:/Users/malcolm.mccrimmon/Documents/Git/utils/utils')

const addM = (...nums) => op('add')(...nums) % 256
const bytesToString = (bytes) => String.fromCharCode(...bytes)
// const stringToBytes = (string) => [...string].map(
//   (_, i) => string.charCodeAt(i)
// )
const stringToBytes = (string) => arrayify(
  (i) => string.charCodeAt(i), string.length
)
const mix = (key, iVec, state, n = 1) => {
  let j = 0
  for (const _ of range(n)) {
    for (const i of range(256)) {
      j = addM(j, state[i], key[i % 256])
      swap(state, i, j)
    }
  }
}

const iVec = arrayify(() => randInt(256), 10)
const ciphertext = 'SomE eXample(1)(!)[?]'
const key = stringToBytes('abcd').concat(iVec)
const blender = []
for (const i of range(256)) blender.push(i)

mix(key, iVec, blender)

const output = [].concat(iVec)
let j = 0
for (const [cByte, k] of stringToBytes(ciphertext).enumerate()) {
  const i = addM(k, 1)
  j = addM(j, state[i])
  swap(state, i, j)
  let n = addM(state[i], state[j])
  output.push(state[n] ^ cByte)
}

console.log(bytesToString(output))
