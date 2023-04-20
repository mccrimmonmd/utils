const fs = require("fs")
const process = require("process")

const jabberwocky = (filePath='Jabberwocky.txt') => {
  try {
    let data = fs.readFileSync(filePath)
    if (data) {
      return data.toString().trim() //trim() removes BOM
    } else {
      console.log("No data!")
      return ''
    }
  } catch (err) {
    console.log(err)
    throw err
  }
}

const masticate = (text) => {
  if (text == null) text = jabberwocky()
  console.log(charCounts(text))
  console.log(charCountsFunc(text))
  console.log("--------------------------------------------")
  console.log(wordCounts(text))
  console.log(wordCountsFunc(text))
}

const charCounts = (text) => {
  let counts = {}
  let charArr = [...text].sort()
  charArr.forEach(c => {
    if (counts[c] == null) {
      counts[c] = 1
    } else {
      counts[c] += 1
    }
  })
  return counts
}

const charCountsFunc = (text) => {
  return [...text].sort().reduce((counts, chara) => {
    if (counts[chara] == null) {
      counts[chara] = 1
    } else {
      counts[chara] += 1
    }
    return counts
  }, {})
}

const wordCounts = (text) => {
  let textArr = text.split(/\s/)
  let sorter = (a, b) => {
    a = a.replace(/[^\w]/g, '')
    b = b.replace(/[^\w]/g, '')
    if (a < b) return -1
    if (b < a) return 1
    return 0
  }
  let sorted = [...textArr].filter(c => c !== '').sort(sorter)
  let counts = {}
  sorted.forEach(word => {
    word = word.replace(/[^\w]/g, '')
    if (counts[word] == null) counts[word] = 1
    else counts[word] += 1
  })
  return counts
}

const wordCountsFunc = (text) => {
  let textArr = text.replace(/[^\w]/g, ' ')
    .split(/\s/)
    .filter(w => w !== '')
    .sort()
  return textArr.reduce((counts, word) => {
    if (counts[word] == null) {
      counts[word] = 1
    } else {
      counts[word] += 1
    }
    return counts
  }, {})
}

if (false) { // DEBUG
  masticate()
}

module.exports = {
  jabberwocky,
  masticate,
  charCounts: charCountsFunc,
  wordCounts: wordCountsFunc,
}
