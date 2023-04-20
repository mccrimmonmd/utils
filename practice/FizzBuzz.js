let fizzBuzz = function() {
	for (let i = 1; i <= 100; i++) {
		if (i % 3 === 0) {
			if (i % 5 === 0) console.log("FizzBuzz");
			else console.log("Fizz");
		}
		else if (i % 5 === 0) {
			console.log("Buzz");
		}
		else console.log(i);
	}
}

let altBuzz = function() {
	for (let i = 1; i <= 100; i++) {
		if (i % 3 !== 0) {
			if (i % 5 !== 0) {
				console.log(i);
			}
			else {
				console.log("Buzz");
			}
		}
		else if (i % 5 !== 0) {
			console.log("Fizz");
		}
		else {
			console.log("FizzBuzz");
		}
	}
}

let finalBuzz = function() {
	for (let i = 1; i <= 100; i += 1) {
		let fizz = i % 3 === 0 ? 'Fizz' : ''
		let buzz = i % 5 === 0 ? 'Buzz' : ''
		let fizzBuzz = fizz + buzz
		console.log(fizzBuzz || i)
	}
}
