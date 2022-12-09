#!/usr/bin/env node
const fwk = new (require('./framework.js'))
const contents = fwk.readInput()

const moves = contents.split("\n").map(line => {
	d = line.split(" ")
	d[1] = parseInt(d[1])
	return d
})

class Point {
	constructor(y, x) {
		this.y = y
		this.x = x
	}

	distance(p) {
		return Math.sqrt(Math.pow(this.y - p.y, 2) + Math.pow(this.x - p.x, 2))
	}

	manhattan(p) {
		return Math.abs(this.y - p.y) + Math.abs(this.x - p.x)
	}

	directionVectorTo(p) {
		let dx = p.x - this.x
		if (dx > 0)
			dx = 1
		else if (dx < 0)
			dx = -1

		let dy = p.y - this.y
		if (dy > 0)
			dy = 1
		else if (dy < 0)
			dy = -1

		return new Point(dy, dx)
	}

	moveTo(vector, times) {
		if (times == null) times = 1
		return new Point(this.y + vector.y * times, this.x + vector.x * times)
	}

	toString() {
		return `${this.y},${this.x}`
	}
}

const directions = {
	'U': new Point(1, 0),
	'D': new Point(-1, 0),
	'R': new Point(0, 1),
	'L': new Point(0, -1)
}

class State {
	constructor(knotsCount) {
		const init = [0, 0]
		this.head = new Point(...init)
		this.knots = new Array(knotsCount).fill(null).map(() => new Point(...init))
		this.visited = new Set()
		this.visited.add(this.tailToString())
	}

	tailToString() {
		return this.knots[this.knots.length - 1].toString()
	}

	move(direction, times) {
		const vector = directions[direction]
		let i = 0
		for (; i < times; i++) {
			this.head = this.head.moveTo(vector, 1)
			for (let i = 0; i < this.knots.length; i++) {
				const prev = i == 0 ? this.head : this.knots[i - 1]
				const knot = this.knots[i]
				if (knot.distance(prev) >= 2.0)
					this.knots[i] = knot.moveTo(knot.directionVectorTo(prev))
			}
			this.visited.add(this.tailToString())
		}
	}
}

function trace(knotsCount, moves) {
	const s = new State(knotsCount)
	for (const move of moves) {
		s.move(...move)
	}
	return s.visited
}

fwk.part1(trace(1, moves).size)
fwk.part2(trace(9, moves).size)
