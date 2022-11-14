const fs = require("fs")
const process = require("process")

fs.readFile(String.raw`.\Jabberwocky.txt`, (err, data) => {
  if (err) {
    console.log(err)
    throw err
  }
  else if (data) masticate(data.toString().trim()) //trim() removes BOM
  else {
    console.log("No data!")
    process.exit()
  }
})

let masticate = (text) => {
  let charCounts = {}
  let charArr = [...text].sort()
  charArr.forEach(c => {
    if (charCounts.hasOwnProperty(c)) {
      charCounts[c] += 1
    } else {
      charCounts[c] = 1
    }
  })
  console.log(charCounts)
  
  // functional version
  let charCounts2 = [...text].sort().reduce((counts, chara) => {
    if (counts[chara] == null) {
      counts[chara] = 1
    } else {
      counts[chara] += 1
    }
    return counts
  }, {})
  console.log(charCounts2)
  
  let textArr = text.split(/\s/)
  let sorter = (a, b) => {
    a = a.replace(/[^\w]/g, '')
    b = b.replace(/[^\w]/g, '')
    if (a < b) return -1
    if (b < a) return 1
    return 0
  }
  let sorted = [...textArr].filter(c => c !== '').sort(sorter)
  let wordCounts = {}
  sorted.forEach(word => {
    word = word.replace(/[^\w]/g, '')
    if (wordCounts.hasOwnProperty(word)) wordCounts[word] += 1
    else wordCounts[word] = 1
  })
  console.log(wordCounts)
  
  // functional version
  textArr = text.replace(/[^\w]/g, ' ')
    .split(/\s/)
    .filter(w => w !== '')
    .sort()
  let wordCounts2 = textArr.reduce((counts, word) => {
    if (counts[word] == null) {
      counts[word] = 1
    } else {
      counts[word] += 1
    }
    return counts
  }, {})
  console.log(wordCounts2)
}
