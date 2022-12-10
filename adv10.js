#!/usr/bin/env node
const fwk = new (require('./framework.js'))
const contents = fwk.readInput()

const ops = contents.split("\n").map(line => line.split(" "))

const INTERVAL_OFFSET = 20
const INTERVAL = 40
const SPRITE_SIZE = 3

class CRT {
	constructor() {
		this.crt = ''
	}

	put(x) {
		const crtOffset = (this.crt.length) % INTERVAL
		const spriteStart = x - 1
		const symbol = (crtOffset >= spriteStart && crtOffset < spriteStart + SPRITE_SIZE) ? '#' : '.'
		this.crt += symbol
	}

	display() {
		const lines = []
		let offset = 0
		while (offset < this.crt.length) {
			lines.push(this.crt.substring(offset, offset + INTERVAL))
			offset += INTERVAL
		}

		return lines.join("\n")
	}
}

function execute(ops) {
	let cycle = 1
	let x = 1
	let sum = 0
	let crt = new CRT()

	for (const op of ops) {
		const prevCycle = cycle
		const prevX = x

		switch (op[0]) {
			case 'noop':
				cycle++
				break;
			case 'addx':
				cycle += 2
				x += parseInt(op[1])
				break;
			default:
				throw (new Error(`Unknown operation ${op[0]}`))
		}

		for (let i = prevCycle; i < cycle; i++) {
			crt.put(prevX)
		}

		const cycleIntervalOffset = cycle % INTERVAL - INTERVAL_OFFSET
		const prevCycleIntervalOffset = prevCycle % INTERVAL - INTERVAL_OFFSET

		if (cycleIntervalOffset >= 0 && prevCycleIntervalOffset < 0) {
			const intervalicCycle = cycle - cycleIntervalOffset
			const value = cycle > intervalicCycle ? prevX : x
			sum += intervalicCycle * value
		}
	}

	return [sum, crt]
}

const r = execute(ops)
fwk.part1(r[0])
fwk.part2("\n" + r[1].display())
