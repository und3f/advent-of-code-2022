#!/usr/bin/env node
const util = require('util')
const fwk = new (require('./framework.js'))
const contents = fwk.readInput()
const lines = contents.split('\n').map(
	line => line.split(' -> ').map(p => p.split(',').map(i => parseInt(i)))
)

class BST {
	constructor() {
	}

	get(key) {
		return this.getFromSubtree(this.root, key)
	}

	getFromSubtree(node, key) {
		if (node === undefined)
			return undefined;

		const cmp = node.key - key
		if (cmp < 0) {
			if (node.key + node.range > key)
				return node

			return this.getFromSubtree(node.right, key)
		}
		if (cmp > 0) {
			return this.getFromSubtree(node.left, key)
		}
		else return node
	}

	put(key, range) {
		this.root = this.putInSubtree(this.root, key, range)
	}

	putInSubtree(node, key, range) {
		if (node === undefined) {
			return {
				key,
				range,
				// n: 1
			}
		}
		const cmp = key - node.key
		if (cmp < 0) {
			node.left = this.putInSubtree(node.left, key, range)
		} else if (cmp > 0) {
			node.right = this.putInSubtree(node.right, key, range)
		} else {
			node.range = Math.max(node.range, range)
			// throw (new Error('Overlapping'))
		}
		// node.n = node.left.n + node.right.n + 1

		return node
	}
}

const sandPouringPoint = [500, 0]
class Particles {
	constructor(lines) {
		this.horizontals = []
		this.verticals = []

		this.planes = [this.verticals, this.horizontals]
		this.addLines(lines)
		// this.initBuffer() // Enable me for animation
	}

	addLines(lines) {
		this.lines = lines
		const planes = this.planes
		for (const line of lines) {
			let plane = line[0][0] === line[1][0] ? 0 : 1

			planes[(plane + 1) % 2].push({
				pos: line[0],
				range: 1
			})

			let prevPlane = plane
			for (let i = 0; i < line.length - 1; i++) {
				let plane = line[i][0] === line[i + 1][0] ? 0 : 1
				const otherPlane = (plane + 1) % 2

				const p1 = line[i][otherPlane]
				const p2 = line[i + 1][otherPlane]

				const start = Math.min(p1, p2)
				const range = Math.abs(p1 - p2) + 1
				const pos = [...line[i]]
				pos[otherPlane] = start

				planes[plane].push({ pos, range })
				if (prevPlane === plane)
					planes[otherPlane].push({
						pos,
						range: 1
					})
				prevPlane = plane
			}

			planes[(plane + 1) % 2].push({
				pos: line[line.length - 1],
				range: 1
			})
		}
	}

	initBuffer() {
		const { xRange, yRange } = this.findRange();
		yRange[0] = 0
		const xOffset = xRange[0]
		const yOffset = yRange[0]
		const width = xRange[1] - xRange[0]
		const height = yRange[1] - yRange[0]

		const buffer = new Array(height).fill(null).map(() => new Array(width).fill(' '))
		const addVector = (s, a) => {
			for (let i = 0; i < s.length; i++)
				s[i] += a[i]
		}

		const isVectorEqual = (s, a) => {
			for (let i = 0; i < s.length; i++)
				if (s[i] !== a[i])
					return false
			return true;
		}

		const direction = (v) => {
			if (v === 0)
				return 0

			return v / Math.abs(v)
		}

		for (const l of lines) {
			for (let i = 0; i < l.length - 1; i++) {
				const s = l[i]
				const e = l[i + 1]
				const v = [direction(e[0] - s[0]), direction(e[1] - s[1])]
				for (const p = [...s]; !isVectorEqual(p, e); addVector(p, v)) {
					buffer[p[1] - yOffset][p[0] - xOffset] = '#'
				}
				buffer[e[1] - yOffset][e[0] - xOffset] = '#'
			}
		}
		this.buffer = buffer
		this.particles = []
		this.xOffset = xOffset
		this.yOffset = yOffset
	}

	findRange() {
		const xRange = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
		const yRange = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

		for (const l of this.horizontals) {
			const y = l.pos[1];
			if (y < yRange[0]) {
				yRange[0] = y;
			} else if (y + 1 > yRange[1]) {
				yRange[1] = y + 1;
			}

			const x = l.pos[0];
			if (x < xRange[0]) {
				xRange[0] = x;
			} else {
				const xLast = x + l.range - 1;
				if (xLast > xRange[1]) {
					xRange[1] = xLast;
				}
			}
		}
		return { xRange, yRange };
	}

	normalizePlanes() {
		normalized = [[], []]
		for (let plane = 0; plane < this.planes.length; plane++) {
			const otherPlane = (plane + 1) % 2
			this.planes[plane].sort(
				(a, b) => {
					const c = a.pos[plane] - b.pos[plane]
					if (c !== 0) return c

					return a.pos[otherPlane] - b.pos[otherPlane]
				}
			)

			const prev = this.planes[plane][0]
			for (let i = 1; i < this.planes[plane]; i++) {
				const p = this.planes[plane][i]
				if (prev[plane] !== p[plane]) {
					normalized[plane].push(prev)
					prev = p
					continue
				}
				prev
			}
		}
		console.log(util.inspect(this.planes, false, null, true))
	}

	draw() {
		process.stdout.write(this.buffer.map(l => l.join('')).join('\n'))
	}

	addParticle(pos) {
		fwk.log('Add particle:', pos)
		for (const plane of [0, 1]) {
			this.planes[plane].push({
				pos: pos,
				range: 1
			})
		}
		// this.buffer[pos[1] - this.yOffset][pos[0] - this.xOffset] = 'o' // Enable me for animation
	}

	filterPlaneLines(pos, plane) {
		const otherPlane = (plane + 1) % 2
		return this.planes[otherPlane].filter(l => l.pos[plane] <= pos[plane] && pos[plane] < l.pos[plane] + l.range)
	}

	findBottomLine(pos) {
		// fwk.log('pos:', pos, this.filterPlaneLines(pos, 0).map(l => l.pos[1]))
		const lines = this.filterPlaneLines(pos, 0).filter(l => pos[1] <= l.pos[1])
		if (lines.length === 0)
			return

		lines.sort((a, b) => a.pos[1] - b.pos[1])
		// fwk.log('lines:', lines)
		return lines[0]
	}

	createBST(lines, plane) {
		const bst = new BST()
		for (const l of lines) {
			// fwk.log(l)
			bst.put(l.pos[plane], 1)
		}
		return bst
	}

	pourSand(pos, stopY) {
		let stable = 0
		let particle
		if (stopY === undefined)
			stopY = pos[1]

		do {
			particle = this.dropParticle(pos)
			if (particle === undefined || particle[1] == stopY) {
				break
			}
			this.addParticle(particle)
			stable++
		} while (particle !== undefined)


		return stable
	}

	dropParticle(p) {
		// fwk.log('Drop particle:', p)
		let pos = null
		let nextPos = [...p]
		while (pos !== nextPos) {
			pos = nextPos
			// fwk.log('Position:', pos)

			const bottom = this.findBottomLine(pos)
			if (bottom === undefined)
				return undefined

			if (bottom.pos[1] !== pos[1] + 1) {
				nextPos = [pos[0], bottom.pos[1] - 1]
				continue
			}

			const bst = this.createBST(this.filterPlaneLines([pos[0], pos[1] + 1], 1), 0)
			for (const offset of [-1, +1]) {
				const offsetPos = [pos[0] + offset, pos[1] + 1]
				const obstacle = bst.get(offsetPos[0])
				// fwk.log("Obstacle:", obstacle, `offset: ${offset}`)
				if (obstacle !== undefined) {
					continue
				}

				const bottom = this.findBottomLine(offsetPos)
				// fwk.log('Bottom:', bottom, offsetPos)
				if (bottom === undefined || offsetPos[1] < bottom.pos[1]) {
					nextPos = offsetPos
					break
				}
			}
		}

		return pos
	}
}

const animation = () => {
	const clc = require("cli-color");
	var stdin = process.stdin;
	stdin.resume()
	stdin.setEncoding('utf-8')

	let step = 0
	const additionalLineY = findCondCoord(lines, Math.max, 1) + 2
	const additionalLine = [[-100, additionalLineY], [100000, additionalLineY]]
	const p = new Particles(lines.concat([additionalLine]))
	stdin.on('data', function (key) {
		step++
		const stepBytes = `Step #${step}`.split('')
		p.buffer[0] = stepBytes.concat(p.buffer[0].slice(stepBytes.length))
		const particle = p.dropParticle(sandPouringPoint)
		if (particle !== undefined) {
			p.addParticle(particle)
		}
		process.stdout.write(clc.erase.screen)
		p.draw()
	});
}

const findCondCoord = (lines, cond, coord) => cond(...lines.flat().map(p => p[coord]))

const findFullPouring = (lines) => {
	const additionalLineY = findCondCoord(lines, Math.max, 1) + 2
	const additionalLine = [[-10000000, additionalLineY], [100000000000, additionalLineY]]
	const p = new Particles(lines.concat([additionalLine]))

	const stopPouringY = 0
	return p.pourSand(sandPouringPoint, stopPouringY) + 1
}

// animation() // Requires enabling planes
fwk.part1(new Particles(lines).pourSand(sandPouringPoint))
fwk.part2(findFullPouring(lines))
