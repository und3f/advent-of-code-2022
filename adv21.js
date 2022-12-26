#!/usr/bin/env node
const fwk = new (require('./framework.js'))
const contents = fwk.readInput()
const monkeyRe = /^(\w+): (\d+|\w+ . \w+)$/
const monkeys = Object.fromEntries(contents.split('\n').map(l => {
	const r = monkeyRe.exec(l)

	const monkey = {
		name: r[1],
	}

	if (isNaN(r[2])) {
		monkey['expression'] = r[2].split(/\s/)
	} else {
		monkey['number'] = parseInt(r[2])
	}
	return monkey
}).map(m => [m.name, m]))

const operations = {
	'+': (a, b) => a + b,
	'-': (a, b) => a - b,
	'*': (a, b) => a * b,
	'/': (a, b) => a / b
}

function calculateMonkeyNumber(monkey, monkeys) {
	fwk.log('calculate', { monkey })
	if (monkey.number !== undefined) {
		return monkey.number
	}

	const [monkey1, operation, monkey2] = monkey.expression
	fwk.log(monkeys[monkey1], monkeys[monkey2])
	monkey.number = operations[operation](
		...[monkey1, monkey2].map(m => calculateMonkeyNumber(monkeys[m], monkeys))
	)

	return monkey.number
}

function formatMonkeyEquality(monkey, monkeys) {
	fwk.log('expression', { monkey })
	if (monkey.number !== undefined) {
		return monkey.number
	}

	const [monkey1, operation, monkey2] = monkey.expression

	const exprMonkeys = [monkey1, monkey2].map(m => formatMonkeyEquality(monkeys[m], monkeys))
	if (exprMonkeys.every(v => !isNaN(v))) {
		return operations[operation](...exprMonkeys)
	}

	return `(${exprMonkeys[0]}${operation}${exprMonkeys[1]})`
}

const monkeysPart1 = JSON.parse(JSON.stringify(monkeys))
fwk.part1(calculateMonkeyNumber(monkeysPart1.root, monkeysPart1))

const monkeysPart2 = JSON.parse(JSON.stringify(monkeys))
monkeysPart2.root.expression[1] = '='
monkeysPart2.humn.number = 'x'

fwk.part2(
	`https://www.wolframalpha.com/input?i2d=true&i=` + encodeURIComponent(formatMonkeyEquality(monkeysPart2.root, monkeysPart2))
)
