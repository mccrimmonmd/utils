let countVowels = function(s) {
  let ret = 0;
  [...s].forEach(c => {
    if ("aeiou".includes(c)) ret += 1;
  });
  return ret;
}

let countVowels2 = (s) =>
  [...s].filter(c => "aeiou".includes(c)).length;

/* Python:
def countVowels(s):
	return len([c for c in s if c in "aeiou"])
*/

/*
5
4
14
*/

console.log(countVowels("abracadabra"));
console.log(countVowels("pear tree"));
console.log(countVowels("o a kak ushakov lil vo kashu kakao"));

console.log(countVowels2("abracadabra"));
console.log(countVowels2("pear tree"));
console.log(countVowels2("o a kak ushakov lil vo kashu kakao"));
