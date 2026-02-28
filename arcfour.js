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
  assert(state[-1] === state[state.length - 1])
  let j = 0
  for (const _ of range(N)) {
    for (const i of range(256)) {
      let n = i % key.length
      j += state[i] + key[n]
      swap(state, i, j)
    }
  }
}

const crypt = (bytes, state) => {
  const output = new Uint8Array(bytes.length)
  let j = 0
  for (const [k, cByte] of bytes.entries()) {
    const i = k + 1
    j += state[i]
    swap(state, i, j)
    let n = state[i] + state[j]
    output[k] = state[n] ^ cByte
  }
  return output
}

// TODO: load from file or take as parameter
const cipherbytes = stringToBytes('=SomE eXample(1)(!)[?]')
const iVec =
  encoding ?
    new Uint8Array(arrayify(() => randInt(256), 10))
  : cipherbytes.slice(0, 10)
const cipher = encoding ? cipherbytes : cipherbytes.slice(10)

const keyText = 'asdfg' // TODO: ditto
const key = new Uint8Array([...stringToBytes(keyText), ...iVec])
const state = indexWrapify([...range(256)])

mix(key, iVec, state)
const output = crypt(cipher, state)

console.log(bytesToString(
  encoding ?
    new Uint8Array([...iVec, ...output])
  : output
))

