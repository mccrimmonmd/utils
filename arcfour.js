const {
  range,
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

const mix = (key, iVec, state, N = 1) => {
  let j = 0
  for (const _ of range(N)) {
    for (const i of range(256)) {
      let n = i % key.length
      j = add256(j, state[i], key[n])
      swap(state, i, j)
    }
  }
}

const iVec = new Uint8Array(arrayify(() => randInt(256), 10))
const ciphertext = '=SomE eXample(1)(!)[?]'
const cipherbytes = stringToBytes(ciphertext)
const keyText = 'asdfg'
const key = new Uint8Array([...stringToBytes(keyText), ...iVec])
const blender = [...range(256)]

mix(key, iVec, blender)

const crypt = new Uint8Array(cipherbytes.length)
let j = 0
for (const [k, cByte] of cipherbytes.entries()) {
  const i = add256(k, 1)
  j = add256(j, state[i])
  swap(state, i, j)
  let n = add256(state[i], state[j])
  crypt[k] = state[n] ^ cByte
}

console.log(bytesToString([...iVec, ...crypt]))
