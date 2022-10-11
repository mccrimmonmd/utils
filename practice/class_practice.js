class Mnumber {}

class Mnatural extends Mnumber{
	constructor(val = 0) {
		super();
		this.value = val;
	}

	static get zero() {return new Mnatural();}

	succ() {
		return new Mnatural(this.value + 1);
	}

	plus(b) {
		let iters = b.value;
		let newVal = this;
		while (iters > 0) {
			newVal = newVal.succ();
			iters -= 1;
		}
		return newVal;
	}

	diff(b) {
		let bigger, smaller;
		if (this.value > b.value) {
			bigger = this.value;
			smaller = b.value;
		}
		else {
			bigger = b.value;
			smaller = this.value;
		}
		let difference = 0;
		while (smaller < bigger) {
			difference += 1;
			smaller += 1;
		}
		return new Mnatural(difference);
	}

	mult(b) {
		let iters = b.value;
		let newVal = this;
		while (iters > 0) {
			newVal = this.plus(b);
			iters -= 1;
		}
		return newVal;
	}
}

class Mint extends Mnatural {
	constructor(val, sign = '+') {
		super(val);
		this.sign = sign;
	}

	plus(b) {
		if (this.sign === b.sign)
			return new Mint(super.plus(b).value, this.sign)
		else if (this.value === b.value)
			return new Mint(0);
		else {
			let newSign;
			if (this.sign === '+')
				newSign = this.value > b.value ? '+' : '-';
			else
				newSign = this.value < b.value ? '+' : '-';

			return new Mint(super.diff(b).value, newSign);
		}
	}

	mult(b) {
		return new Mint(super.mult(b).value, this.sign === b.sign ? '+' : '-');
	}
}

class Mrat extends Mint {
	constructor(num, den = 1, sign = '+') {
		if (den === 0) throw new Error("Denominator cannot be zero.");
		//TODO: reduce!
		super(num, sign);
		this.den = den;
	}

	get num() {
		return this.value;
	}

	plus(b) {
		if (this.den === b.den) {
			let mint = super.plus(b);
			return new Mrat(mint.value, this.den, mint.sign);
		}
		else {
			//TODO: find common factor
			let newNum = new Mint(this.num, this.sign).plus(new Mint(b.num, b.sign));
			let newDen = this.den + b.den; //TODO: oh no wait this is totally wrong
			return new Mrat(newNum.value, newDen, newNum.sign);
		}
	}

	mult(b) {
		let newNom = super.mult(b);
		let newDen = super.mult(new Mint(b.den));
		return new Mrat(newNom.value, newDen.value, newNom.sign);
	}
}


let one = new Mint(1);
let two = new Mint(2);
let three = one.plus(two);
let four = two.mult(two);
let minusFour = new Mint(4, '-');
let minusThree = one.plus(minusFour);
let plusOne = minusThree.plus(four);
console.log(one, two, three, four);
console.log(minusThree, minusFour);
console.log(plusOne);
