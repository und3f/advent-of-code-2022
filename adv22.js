#!/usr/bin/env node
const fwk = new (require('./framework.js'))
const contents = fwk.readInput()

const [mazeStr, instructionsStr] = contents.split('\n\n')
const maze = mazeStr.split('\n')

class Path {
	constructor(maze) {
		this.maze = maze
		const y = 0
		let x = 0
		for (; x < maze[y].length; x++) {
			if (this.isEmpty([y, x])) {
				break
			}
		}

		if (x > maze[y].length) {
			throw (new Error('Invalid map'))
		}

		this.pos = [y, x]
		this.direction = [0, 1]
	}

	moveForward() {
		const newPos = fwk.utils.addVectors(this.pos, this.direction)

		const tile = this.getMazeTile(newPos)

		fwk.log({ tile })
		switch (tile) {
			case '.':
				this.pos = newPos
				return true
			case ' ':
			case '':
				const wrapPos = this.getWrapTile(newPos)
				if (this.isEmpty(wrapPos)) {
					this.pos = wrapPos
					return true
				}
				return false
		}

		return false
	}

	getMazeTile(pos) {
		const [y, x] = pos

		if (y < 0 || y >= this.maze.length) {
			return ''
		}

		return this.maze[y].charAt(x)
	}

	isEmpty(pos) {
		return this.getMazeTile(pos) === '.'
	}

	isValidTile(pos) {
		const t = this.getMazeTile(pos)
		return t !== ' ' && t != ''
	}

	getWrapTile(pos) {
		const d = this.direction.map(v => -v)

		let prevPos = pos
		let newPos = fwk.utils.addVectors(pos, d)
		for (; this.isValidTile(newPos); newPos = fwk.utils.addVectors(newPos, d)) {
			prevPos = newPos
		}

		return prevPos
	}

	rotateClockwise() {
		const [y, x] = this.direction
		this.direction = [x, -y]
	}

	rotateCounterclockwise() {
		const [y, x] = this.direction
		this.direction = [-x, y]
	}

	toString() {
		const facingSymbols = ['>', 'v', '<', '^']
		const sIndex = this.getFacingValue()

		const s = facingSymbols[sIndex]

		let str = ''
		for (let y = 0; y < this.maze.length; y++) {
			if (y !== this.pos[0]) {
				str += this.maze[y]
			} else {
				str += this.maze[y].substr(0, this.pos[1])
				str += s
				str += this.maze[y].substr(this.pos[1] + 1)
			}

			str += '\n'
		}

		return str
	}

	getFacingValue() {
		return this.direction[0] === 0 ? this.direction[1] < 0 ? 2 : 0 : this.direction[0] < 0 ? 4 : 1
	}

	getScore() {
		return 1000 * (this.pos[0] + 1) + 4 * (this.pos[1] + 1) + this.getFacingValue()
	}

}

function parseInstructions(instructionsStr) {
	const instrRe = /\d+|\w/g
	const instructions = []

	let r
	while ((r = instrRe.exec(instructionsStr)) != null) {
		let v = r[0]
		if (!isNaN(v)) {
			v = parseInt(v)
		}

		instructions.push(v)
	}

	return instructions
}

function trace(path, instructions) {
	for (const i of instructions) {
		fwk.log(i)
		switch (i) {
			case 'R':
				path.rotateClockwise()
				break
			case 'L':
				path.rotateCounterclockwise()
				break
			default:
				for (let j = 0; j < i; j++) {
					if (!path.moveForward(i)) {
						break
					}
				}
		}

		fwk.log(path.toString())
	}
}

const path = new Path(maze)
const instructions = parseInstructions(instructionsStr)

fwk.log(path.toString())

trace(path, instructions)

fwk.part1(path.getScore())
fwk.part2()
