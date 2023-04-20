const sortString = (text, linear=false) => {
  if (text.length <= 1) return text
  const textArr = text.split('')
  const sorted = linear 
    ? linearSort(textArr, linear.alphabet, linear.sorted)
    : mergeSort(textArr)
  return sorted.join('')
}

const mergeSort = (items) => {
  const divide = (arr) => {
    let midpoint = Math.floor(arr.length / 2)
    return {
      left: arr.slice(0, midpoint),
      right: arr.slice(midpoint, arr.length)
    }
  }
  
  const conquer = ({left, right}) => {
    if (left.length > 1) {
      left = conquer(divide(left))
    }
    if (right.length > 1) {
      right = conquer(divide(right))
    }
    return merge(left, right)
  }
  
  const merge = (left, right) => {
    let sorted = []
    console.assert(right.length >= left.length, 'right length greater')
    let i = 0
    let j = 0
    while (i < left.length || j < right.length) {
      if (left[i] <= right[j] || j >= right.length) {
        sorted = sorted.concat(left[i])
        i++
      }
      else {
        sorted = sorted.concat(right[j])
        j++
      }
    }
    console.assert(sorted.length === left.length + right.length, 'sorted length')
    return sorted
  }
  
  return conquer(divide(items))
}

const linearSort = (items, alphabet, sorted=true) => {
  if (typeof alphabet === 'string') alphabet = alphabet.split('')
  if (!sorted) alphabet = mergeSort(alphabet)
  const counts = new Array(alphabet.length).fill(0)
  const indexOf = {}
  alphabet.forEach((symbol, i) => indexOf[symbol] = i)
  items.forEach(symbol => {
    counts[indexOf[symbol]] += 1
  })
  let output = []
  counts.forEach((count, i) => {
    if (count > 0) output = output.concat(new Array(count).fill(alphabet[i]))
  })
  return output
}

if (false) { // DEBUG
  // let { jabberwocky: testString } = require('./string_practice')
  // testString = testString().replace(/\W/g, '')
  let testString = 'malcolmmccrimmon'
  
  // let result = sortString(testString)
  let result = sortString(testString, { alphabet: 'abcdefghijklmnopqrstuvwxyz })
  console.assert(testString.length === result.length, 'result string length')
  console.assert(testString.split('').sort().join('') === result, 'sorted')
  console.log(result)
}

module.exports = {
  sortString,
  mergeSort,
  linearSort,
}
