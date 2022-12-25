#!/usr/bin/env node
const fwk = new (require('./framework.js'))
const contents = fwk.readInput()
const snafuNumbers = contents.split('\n')

const symbolValue = {
	2: 2,
	1: 1,
	0: 0,
	'-': -1,
	'=': -2
}

function convertSnafuToDecimal(snafu) {
	let value = 0

	let power = 1
	for (let i = snafu.length - 1; i >= 0; i--) {
		let s = symbolValue[snafu.charAt(i)]
		value += s * power

		power *= 5
	}

	return value
}

function snafuRange(digits) {
	return [convertSnafuToDecimal('2'.repeat(digits)), convertSnafuToDecimal('='.repeat(digits))]
}

const BASE = 5
function converDecimalToSnafu(number) {
	const digits = Math.ceil(Math.log(number) / Math.log(BASE))
	const [snafuMax] = snafuRange(digits)

	let i = 0
	const snafu = new Array(digits).fill(0)

	if (snafuMax < number) {
		snafu.unshift(1)
		i++
	}

	for (; i < snafu.length; i++) {
		const leftDigits = snafu.length - i - 1
		const [snafuMax, snafuMin] = snafuRange(leftDigits)
		for (let j of Object.keys(symbolValue)) {
			snafu[i] = j
			const currentNumber = convertSnafuToDecimal(snafu.join(''))
			if (currentNumber + snafuMax >= number && currentNumber + snafuMin <= number) {
				break
			}
		}
	}

	return snafu.join('')
}

let sum = 0
for (const snafu of snafuNumbers) {
	sum += convertSnafuToDecimal(snafu)
}

fwk.part1(converDecimalToSnafu(sum))
fwk.part2()
