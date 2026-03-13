const {
  range,
  arrayify,
  swap,
  indexWrapify,
  random: {
    randInt
  },
} = require('./utils')

const bytesToString = (bytes) => String.fromCharCode(...bytes)
const stringToBytes = (string) => new Uint8Array(arrayify(
  (i) => string.charCodeAt(i),
  string.length
))
const parseHex = (strings) => new Uint8Array(arrayify(
  (i) => Number('0x' + strings[i]),
  strings.length
))
const parseDec = (strings) => new Uint8Array(arrayify(
  (i) => Number(strings[i]),
  strings.length
))

const mix = (key, state, N = 1) => {
  console.assert(state[-1] === state[state.length - 1])
  let j = 0
  for (const _ of range(N)) {
    for (const i of range(256)) {
      j += state[i] + key[i % key.length]
      swap(state, i, j)
    }
  }
}

const crypt = (bytes, state) => {
  console.assert(state[-1] === state[state.length - 1])
  const output = []
  let i = 0
  let j = 0
  for (const cByte of bytes) {
    i += 1
    j += state[i]
    swap(state, i, j)
    let n = state[i] + state[j]
    output.push(state[n] ^ cByte)
  }
  return new Uint8Array(output)
}

// TODO: load input from files and/or take as parameters
const encode = false
const rawText = '=SomE eXample(1)(!)[?]'
const rawBytes = parseHex(`
D4 BB 4D 31 68 07 91 2A 6A 79 A7 29 FA 94 92 FE
3A 55 F5 A9 B6 A0 E5 5F 0F 06 39 C2 97 65 AF 61
76 15 B2 48 FB DC 53 FA 8E 36 69 ED 5C A0 D8 E6
80 F3 22 7B D8 9B 4D 15 11 AB 9E 97 88 0B 90 C4
DF 38 20 BE 01 2E 37 2D F4 BF 05 C2 A6 36 27 7B
C8 2A 10 9D 26 63 00 1E 2E 49 30 74 F7 45 40 7E
F0 6C A2 AE E1 20 F0 33 AF C7 AF CB 17 7A 34 42
6D 76 0F 0E 95 7F 6C C5 5E B9 0F 4A 7E D6 7B 3F
40 1A A1 17 72 74 99 A0 4D EF 16 B6 3B 97 28 AD
CA EC A6 1B DC A5 B3 12 6E 99 A6 97 8A E9 2A A1
8E 4D 02 37 CA 5E 49 96 8E E9 7A B3 22 12 D2 12
D1 D3 4D 10 7F 42 1C 24 45 7B 41 1E 17 EA DE 2E
CD D4 4D B1 74 7E F8 7C F6 9C C0 CD C1 A9 C4 7C
A6 6E 2E DC A2 73 17 9C D6 51 01 88 DC C7 F7 48
02 4C C3 5E 9B 16 58 D5 9F 8C A0 96 D7 F9 18 E7
37 D1 82 F0 CB 83 DA 74 EB 35 58 AB A8 7D 39 49
F8 74 10 56 3C 4A BD E8 F9 51 7C A6 76 C7 DF 52
52 C4 AC 2F 3C C8 9E 88 CF E0 D8 26 07 0F B0 E3
9C 91 4F C8 78 F3 C1 B9 4D B9 9C 1A AA C3 1E 58
EE 79 0D 1F 2C 59 ED 3A 21 18 5E 0A B5 E8 E0 BE
DE C9 13 0B 54 92 CF 88 60 7C 4F E8 39 5C 4E 38
1C E3 DA 92 3D 56 CA 8F 9D 60 28 6D 35 4B FF E9
F7 85 02 5E 74 84 04 4B 75 95 11 1C CF 57 B9 3F
9F 9A E3 75 40 45 D8 91 F1 84 12 A3 F0 E4 03 F7
BB 39 14 1A F7 1F 2E B9 14 86 3B 32 F2 A5 3C 27
D2 63 EF B5 B1 01 D6 F3 92 82 D4 3A 3F C4 4B 60
B3 2B 0D 52 66 17 A6 21 04 97 FA 93 3A 9E      
`.split(/\s+/).filter(s => s !== ''))
console.log(rawBytes)
// const rawBytes = parseDec(
;`
ba 9a b4 cf fb 77 00 e6 18 e3 82 e8 fc c5 ab 98
13 b1 ab c4 36 ba 7d 5c de a1 a3 1f b7 2f b5 76
3c 44 cf c2 ac 77 af ee 19 ad
`
;`
6f 6d 0b ab f3 aa 67 19 03 15 30 ed b6 77 ca 74 e0 08 9d d0 
e7 b8 85 43 56 bb 14 48 e3 7c db ef e7 f3 a8 4f 4f 5f b3 fd 
`
;`
D4 BB 4D 31 68 07 91 2A 6A 79 A7 29 FA 94 92 FE
3A 55 F5 A9 B6 A0 E5 5F 0F 06 39 C2 97 65 AF 61
76 15 B2 48 FB DC 53 FA 8E 36 69 ED 5C A0 D8 E6
80 F3 22 7B D8 9B 4D 15 11 AB 9E 97 88 0B 90 C4
DF 38 20 BE 01 2E 37 2D F4 BF 05 C2 A6 36 27 7B
C8 2A 10 9D 26 63 00 1E 2E 49 30 74 F7 45 40 7E
F0 6C A2 AE E1 20 F0 33 AF C7 AF CB 17 7A 34 42
6D 76 0F 0E 95 7F 6C C5 5E B9 0F 4A 7E D6 7B 3F
40 1A A1 17 72 74 99 A0 4D EF 16 B6 3B 97 28 AD
CA EC A6 1B DC A5 B3 12 6E 99 A6 97 8A E9 2A A1
8E 4D 02 37 CA 5E 49 96 8E E9 7A B3 22 12 D2 12
D1 D3 4D 10 7F 42 1C 24 45 7B 41 1E 17 EA DE 2E
CD D4 4D B1 74 7E F8 7C F6 9C C0 CD C1 A9 C4 7C
A6 6E 2E DC A2 73 17 9C D6 51 01 88 DC C7 F7 48
02 4C C3 5E 9B 16 58 D5 9F 8C A0 96 D7 F9 18 E7
37 D1 82 F0 CB 83 DA 74 EB 35 58 AB A8 7D 39 49
F8 74 10 56 3C 4A BD E8 F9 51 7C A6 76 C7 DF 52
52 C4 AC 2F 3C C8 9E 88 CF E0 D8 26 07 0F B0 E3
9C 91 4F C8 78 F3 C1 B9 4D B9 9C 1A AA C3 1E 58
EE 79 0D 1F 2C 59 ED 3A 21 18 5E 0A B5 E8 E0 BE
DE C9 13 0B 54 92 CF 88 60 7C 4F E8 39 5C 4E 38
1C E3 DA 92 3D 56 CA 8F 9D 60 28 6D 35 4B FF E9
F7 85 02 5E 74 84 04 4B 75 95 11 1C CF 57 B9 3F
9F 9A E3 75 40 45 D8 91 F1 84 12 A3 F0 E4 03 F7
BB 39 14 1A F7 1F 2E B9 14 86 3B 32 F2 A5 3C 27
D2 63 EF B5 B1 01 D6 F3 92 82 D4 3A 3F C4 4B 60
B3 2B 0D 52 66 17 A6 21 04 97 FA 93 3A 9E      
`
;`
 27,  75, 142,  76,  43, 117, 118,  60,
103, 103, 211,  78, 231, 136, 140,   2,
192,  88, 217, 184, 202,  88,  95, 252,
 33,   5,   9, 171, 202,  58,  71, 104
`
;`
141,   5, 252,  67, 213, 211, 115, 247,
232,  15, 229, 241, 220, 154, 247, 176,
 65, 140,  83, 136, 159, 198, 214,  25,
 75,  69,  66, 157,   4, 169, 204, 121
`

const cipherbytes =
  encode ?
    stringToBytes(rawText)
  : rawBytes
if (encode) console.assert(bytesToString(cipherbytes) === rawText)
//const keyText = 'asdfg'
const keyText = 'SecretMessageforCongress'

const iVec =
  encode ?
    arrayify(() => randInt(256), 10)
  : cipherbytes.slice(0, 10)
const cipher = encode ? cipherbytes : cipherbytes.slice(10)

const key = new Uint8Array([...stringToBytes(keyText), ...iVec])
const state = indexWrapify([...range(256)])

mix(key, state)
const output = crypt(cipher, state)

console.log(
  encode ?
    new Uint8Array([...iVec, ...output])
  : bytesToString(output)
)

