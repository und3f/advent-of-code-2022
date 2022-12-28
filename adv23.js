#!/usr/bin/env node
const clc = require("cli-color");
const fwk = new (require('./framework.js'))
const contents = fwk.readInput()

const elves = new Set()
const craterHeight = contents.split('\n').length
const craterWidth = contents.split('\n')[0].split('').length

contents.split('\n').forEach((l, y) => {
	l.split('').forEach((s, x) => {
		if (s === '#') {
			elves.add(y * craterWidth + x)
		}
	})
})

class Crater {
	constructor(heightOrig, widthOrig, elves, resize = 10) {
		this.height = heightOrig + resize * 2
		this.width = widthOrig + resize * 2

		const elveResize = 0 // this.width * resize + resize
		this.elves = new Set([...elves].map(e => {
			const y = Math.floor(e / widthOrig)
			const x = e % widthOrig
			return (y + resize) * this.width + x + resize
		}))

		this.maxPos = this.height * this.width - 1

		const vectors = this.vectors = {
			N: -this.width,
			S: this.width,
			W: -1,
			E: 1
		}

		this.checks = {
			S: [vectors.S, vectors.S + vectors.E, vectors.S + vectors.W],
			N: [vectors.N, vectors.N + vectors.E, vectors.N + vectors.W],
			E: [vectors.E, vectors.E + vectors.S, vectors.E + vectors.N],
			W: [vectors.W, vectors.W + vectors.S, vectors.W + vectors.N]
		}
		this.directions = Object.keys(vectors)
	}

	hasElvesAround(pos) {
		const { checks, vectors, width } = this

		const directionsAround = checks.S.concat(checks.N).concat(vectors.E, vectors.W)
		for (const checkVector of directionsAround) {
			const checkPosition = pos + checkVector

			if (checkVector === 1 || checkVector === -1) {
				if (Math.abs(pos % width - checkPosition % width) > 1) {
					continue
				}
			}

			if (this.elves.has(checkPosition)) {
				return true
			}
		}

		return false
	}

	proposeMove(pos) {
		const { checks, vectors, width } = this

		if (!this.hasElvesAround(pos)) {
			return
		}

		for (const direction of this.directions) {
			const newPos = pos + vectors[direction]

			if (newPos < 0 || newPos > this.maxPos) {
				continue
			}
			// fwk.log('Move proposal', {pos, direction, newPos})

			if (direction === 'E' || direction === 'W') {
				if (Math.abs(pos % width - newPos % width) > 1) {
					continue
				}
			}

			let isValidMove = true
			for (const checkVector of checks[direction]) {
				const checkPosition = pos + checkVector
				// fwk.log('Checking', {pos, checkPosition})
				if (this.elves.has(checkPosition)) {
					isValidMove = false
					continue
				}
			}

			// fwk.log('Check result', isValidMove)
			if (isValidMove) {
				return newPos
			}
		}

		return
	}

	move() {
		let moved = false

		const proposedMoves = []
		const proposedToPos = {}
		// fwk.log(this.elves)
		for (const pos of this.elves.values()) {
			const proposedPos = this.proposeMove(pos)
			if (proposedPos === undefined) {
				continue
			}

			proposedMoves.push([pos, proposedPos])
			proposedToPos[proposedPos] = (proposedToPos[proposedPos] || 0) + 1
		}
		// fwk.log(proposedMoves)

		for (const [from, to] of proposedMoves) {
			// fwk.log({from, to, numberOfProposals: proposedToPos[to]})
			if (proposedToPos[to] < 2) {
				!this.elves.delete(from)
				this.elves.add(to)

				moved = true
			}
		}

		this.directions = this.directions.slice(1).concat([this.directions[0]])

		return moved
	}

	findElvesRegion() {
		let yRange = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
		let xRange = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]

		for (const elve of this.elves.values()) {
			const y = Math.floor(elve / this.width)
			const x = elve % this.width

			if (y < yRange[0]) {
				yRange[0] = y
			} else if (y > yRange[1]) {
				yRange[1] = y
			}

			if (x < xRange[0]) {
				xRange[0] = x
			} else if (x > xRange[1]) {
				xRange[1] = x
			}
		}

		return [yRange, xRange]
	}

	calculateScore() {
		const range = this.findElvesRegion()

		return (range[0][1] - range[0][0] + 1) * (range[1][1] - range[1][0] + 1) - this.elves.size
	}

	toString(range = [[0, this.height - 1], [0, this.width - 1]]) {
		let str = ''
		for (let i = range[0][0]; i <= range[0][1]; i++) {
			for (let j = range[1][0]; j <= range[1][1]; j++) {
				str += this.elves.has(i * this.width + j) ? '#' : '.'
			}
			str += '\n'
		}

		return str
	}
}

const crater = new Crater(craterHeight, craterWidth, elves, 1000)

let round
for (round = 1; round <= 10; round++) {
	crater.move()
}

fwk.part1(crater.calculateScore())

for (; crater.move(); round++) { }

fwk.part2(round)
