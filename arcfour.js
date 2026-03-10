const {
  range,
  arrayify,
  swap,
  indexWrapify,
  random: {
    randInt
  },
  op,
} = require('./utils')

const bytesToString = (bytes) => String.fromCharCode(...bytes)
const stringToBytes = (string) => new Uint8Array(arrayify(
  (i) => string.charCodeAt(i), string.length
))

const mix = (key, state, N = 1) => {
  assert(state[-1] === state[state.length - 1])
  let j = 0
  for (const _ of range(N)) {
    for (const i of range(256)) {
      j += state[i] + key[i % key.length]
      swap(state, i, j)
    }
  }
}

const crypt = (bytes, state) => {
  assert(state[-1] === state[state.length - 1])
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

mix(key, state)
const output = crypt(cipher, state)

console.log(bytesToString(
  encoding ?
    new Uint8Array([...iVec, ...output])
  : output
))

for (const i of range(256)) {
  state[i] = undefined
  key[i] = undefined
  keyText[i] = undefined
  output[i] = undefined
  cipherbytes[i] = undefined
}
delete state
delete key
delete keyText
delete cipherbytes
delete cipher
delete output
delete cipherbytes
