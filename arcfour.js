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

const add256 = (...nums) => op('add')(...nums) % 256
const bytesToString = (bytes) => String.fromCharCode(...bytes)
const stringToBytes = (string) => new Uint8Array(arrayify(
  (i) => string.charCodeAt(i), string.length
))

const mix = (key, iVec, state, n = 1) => {
  let j = 0
  for (const _ of range(n)) {
    for (const i of range(256)) {
      j = (j + state[i] + key[i % key.length]) % 256
      swap(state, i, j)
    }
  }
}

const iVec = new Uint8Array(arrayify(() => randInt(256), 10))
const ciphertext = '=SomE eXample(1)(!)[?]'
const cipherbytes = stringToBytes(ciphertext)
const keyText = 'asdfg'
const key = new Uint8Array([...stringToBytes(keyText), ...iVec])
const blender = arrayify( (i) => i, 256 )
// for (const i of range(256)) blender.push(i)

mix(key, iVec, blender)

const output = new Uint8Array(iVec.length + cipherbytes.length)
let j = 0
for (const [cByte, k] of stringToBytes(ciphertext).enumerate()) {
  const i = add256(k, 1)
  j = add256(j, state[i])
  swap(state, i, j)
  let n = add256(state[i], state[j])
  output.push(state[n] ^ cByte)
}

console.log(bytesToString(output))
