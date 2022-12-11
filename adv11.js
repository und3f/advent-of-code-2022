#!/usr/bin/env node
const fwk = new (require('./framework.js'))

const contents = fwk.readInput()

class Monkey {
	constructor(mobj, divider, modulo) {
		this.name = mobj.name
		this.items = mobj.startingItems
		this.test = mobj.test
		this.ifTrue = mobj.ifTrue
		this.ifFalse = mobj.ifFalse
		const expression = this.expression = mobj.expression
		this.operation = (old) => {
			return eval(expression)
		}
		this.itemsInspected = 0
		this.divider = divider
		this.modulo = modulo
	}

	evaluateItem(item) {
		const value = Math.floor(this.operation(item) / this.divider) % this.modulo
		const test = value % this.test.divisibleBy === 0
		const nextMonkey = test ? this.ifTrue : this.ifFalse

		// console.log(`${this.name}: item ${item} new value ${value} throw to ${nextMonkey.throwTo}`)
		return [value, nextMonkey.throwTo]
	}

	turn(monkeys) {
		const items = this.items
		this.items = []

		for (const item of items) {
			const [value, nextMonkey] = this.evaluateItem(item)
			monkeys[nextMonkey].addItem(value)
			this.itemsInspected++
		}
	}

	addItem(item) {
		this.items.push(item)
	}

	toString() {
		return `${this.name}: ${this.items.join(', ')}`
	}
}

function gcd(a, b) {
	return !b ? a : gcd(b, a % b);
}

function lcm(a, b) {
	return (a * b) / gcd(a, b);
}

function arrayLCM(arr) {
	return arr.reduce((a, v) => lcm(a, v), 1)
}

function initMonkeys(divider) {
	const mobjs =
		contents.split("\n\n").map(monkey =>
			monkey.split("\n").map(
				line => (line.trim().split(/: */))
			)
		).map(m => {
			const mobj = Object.fromEntries(
				[['name', m[0][0]]].concat(m.slice(1).map(l => [camelize(l[0]), l[1]]))
			)

			mobj.startingItems = mobj.startingItems.split(/, */).map(i => parseInt(i))
			const testRe = /(divisible by) (\d+)/.exec(mobj.test)
			mobj.test = { [camelize(testRe[1])]: testRe[2] }
			for (const key of ['ifTrue', 'ifFalse']) {
				const e = /(throw to) monkey (\d+)/.exec(mobj[key])
				mobj[key] = { [camelize(e[1])]: parseInt(e[2]) }
			}

			let [_null, expression] = mobj.operation.split(' = ')
			mobj.expression = expression

			return mobj
		})

	const modulo = arrayLCM(mobjs.map(m => m.test.divisibleBy))
	return mobjs.map(mobj => new Monkey(mobj, divider, modulo))
}

function camelize(str) {
	return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
		return index === 0 ? word.toLowerCase() : word.toUpperCase();
	}).replace(/\s+/g, '');
}

function round(monkeys) {
	for (m of monkeys) {
		m.turn(monkeys)
	}
	// console.log(monkeys.map(m => m.toString()).join("\n"))
}

function processRounds(monkeys, rounds) {
	for (let i = 0; i < rounds; i++) {
		round(monkeys)
	}

	let activeMonkeys = [...monkeys]
	activeMonkeys.sort((b, a) => a.itemsInspected - b.itemsInspected)

	return activeMonkeys[0].itemsInspected * activeMonkeys[1].itemsInspected
}

fwk.part1(processRounds(initMonkeys(3), 20))
fwk.part2(processRounds(initMonkeys(1), 10000))

