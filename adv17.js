#!/usr/bin/env node

const slice = require('cli-color/slice.js')

const fwk = new (require('./framework.js'))
const contents = fwk.readInput()

const stream = contents.split('')

const FIGURE_MAX_LENGTH = 4
const FIGURE_MAX_HEIGHT = 4
const CHAMBER_WIDTH = 7
const START_X = 2
const START_Y_BOTTOM_OFFSET = 3
const FIGURES_TO_FALL = 2022
const FIGURES_TO_FALL_PART2 = 1000000000000

const FIGURES = `
####

.#.
###
.#.

..#
..#
###

#
#
#
#

##
##
`.trim().split('\n\n').map(f => f.split('\n'))

function drawChamper(chamber, startY, endY, figure, pos) {
	const chmb = chamber.slice(startY, endY + 1).map(a => [...a])
	if (figure !== undefined) addFigure(chmb, figure, move(pos, [-startY, 0]), '@')
	process.stdout.write(chmb.map(l => `|${l.join('')}|`).join('\n'))
	process.stdout.write(`\n+${'-'.repeat(chamber[0].length)}+\n`)
}

function move(pos, vec) {
	const newPos = new Array(pos.length)
	for (let i = 0; i < pos.length; i++)
		newPos[i] = pos[i] + vec[i]

	return newPos
}

function isLegitPosition(chamber, figure, pos) {
	if (pos[0] < 0 || pos[1] < 0)
		return false

	if (pos[1] + figure[0].length > chamber[0].length)
		return false

	if (pos[0] + figure.length > chamber.length)
		return false

	for (let y = 0; y < figure.length; y++) {
		for (let x = 0; x < figure[y].length; x++) {
			if (figure[y][x] === '#') {
				if (chamber[pos[0] + y][pos[1] + x] !== '.') {
					return false
				}
			}
		}
	}

	return true
}

const vectors = {
	'>': [0, 1],
	'<': [0, -1],
	'v': [1, 0],
}

function addFigure(chamber, figure, pos, symbol = '#') {
	for (let y = 0; y < figure.length; y++) {
		for (let x = 0; x < figure[y].length; x++) {
			if (figure[y][x] === '#') {
				chamber[pos[0] + y][pos[1] + x] = symbol
			}
		}
	}
}

function sliceChamber(chamber) {
	for (let y = 0; y < chamber.length; y++) {
		let isSlicable = true
		for (let x = 0; x < chamber[y].length; x++) {
			if (chamber[y][x] !== '#') {
				isSlicable = false
				break
			}
		}

		if (isSlicable) {
			const height = chamber.length
			const slicedHeight = height - y

			const newChamber = new Array(slicedHeight).fill(null).map(l => new Array(CHAMBER_WIDTH).fill('.')).concat(chamber.slice(0, y))
			return [newChamber, slicedHeight]
		}
	}
	return
}

function fallFigures(numberOfFigures, jetPattern) {
	let jetPatternPosition = 0
	const maxHeight = FIGURE_MAX_HEIGHT * numberOfFigures

	const chamber = new Array(maxHeight).fill(null).map(l => new Array(CHAMBER_WIDTH).fill('.'))
	let maxY = chamber.length

	for (let f = 0; f < numberOfFigures; f++) {
		const figure = FIGURES[f % FIGURES.length]

		const fstartY = maxY - START_Y_BOTTOM_OFFSET - figure.length
		let pos = [fstartY, START_X]

		do {
			const windyPos = move(pos, vectors[jetPattern[jetPatternPosition]])
			if (isLegitPosition(chamber, figure, windyPos)) pos = windyPos

			jetPatternPosition = (jetPatternPosition + 1) % jetPattern.length

			const fallingPos = move(pos, vectors.v)
			if (!isLegitPosition(chamber, figure, fallingPos)) break

			pos = fallingPos

			// drawChamper(chamber, fstartY, pos[0] + 10, figure, pos)
		} while (true)
		addFigure(chamber, figure, pos)
		// drawChamper(chamber, fstartY, pos[0] + 10)
		y = pos[0]

		maxY = Math.min(maxY, y)
		// fwk.log(f, chamber.length - maxY)
	}
	// drawChamper(chamber, maxY, maxY + 10)

	return chamber.slice(maxY)
}

function sliceToNumber(arr, bits = 8) {
	const m = 1 << bits
	return arr.reduce((a, v) => a * m + v, 0)
}

function findPattern(chamber) {
	const arr = chamber.map(l => {
		return parseInt(l.map(f => f === '#' ? 1 : 0).join(''), 2)
	})

	const searchSize = 6
	for (let i = 0; i < arr.length - searchSize * 2; i++) {
		const number = sliceToNumber(arr.slice(i, i + searchSize))

		for (let j = i + searchSize; j < i + searchSize + 400; j++) {
			const numberB = sliceToNumber(arr.slice(j, j + searchSize))
			if (numberB === number) {
				return [i, j - i]
			}
		}
	}

	return
}

const chamber = fallFigures(FIGURES_TO_FALL, stream)
fwk.part1(chamber.length)

// const [patternIndex, patternSize] = findPattern(chamber)
// drawChamper(chamber, patternIndex, patternIndex + 80)
// drawChamper(chamber, patternIndex + patternSize, patternIndex + patternSize + 80)
// fwk.log(patternSize)
// const patternFigures = fwk.utils.lcm(stream.length, FIGURES.length)
// fwk.part2(fallFigures(FIGURES_TO_FALL_PART2, stream))
