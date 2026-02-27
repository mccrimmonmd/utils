const {
  range,
  arrayify,
  swap,
  indexWrapify,
  random: {
    randInt
  },
  op,
} = require('C:/Users/malcolm.mccrimmon/Documents/Git/utils/utils')

const bytesToString = (bytes) => String.fromCharCode(...bytes)
const stringToBytes = (string) => new Uint8Array(arrayify(
  (i) => string.charCodeAt(i), string.length
))

const mix = (key, iVec, state, N = 1) => {
  let j = 0
  for (const _ of range(N)) {
    for (const i of range(256)) {
      let n = i % key.length
      j += state[i] + key[n]
      swap(state, i, j)
    }
  }
}

const iVec = new Uint8Array(arrayify(() => randInt(256), 10))
const ciphertext = '=SomE eXample(1)(!)[?]'
const cipherbytes = stringToBytes(ciphertext)
const keyText = 'asdfg'
const key = new Uint8Array([...stringToBytes(keyText), ...iVec])
const state = indexWrapify([...range(256)])

mix(key, iVec, state)

const crypt = new Uint8Array(cipherbytes.length)
let j = 0
for (const [k, cByte] of cipherbytes.entries()) {
  const i = k + 1
  j += state[i]
  swap(state, i, j)
  let n = state[i] + state[j]
  crypt[k] = state[n] ^ cByte
}

console.log(bytesToString([...iVec, ...crypt]))
