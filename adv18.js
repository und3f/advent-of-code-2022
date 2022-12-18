#!/usr/bin/env node
const fwk = new (require('./framework.js'))
const contents = fwk.readInput()

const cubesMap = new Set(contents.split('\n'))

function forEachSide(cube, onSide) {
	for (let i = 0; i < 3; i++) {
		for (let j of [-1, 1]) {
			const sideCube = [...cube]
			sideCube[i] += j
			onSide(sideCube)
		}
	}
}

function countSides(cubesSet, cond = (cubeStr) => true) {
	let sides = 0
	for (const c of cubesSet.values()) {
		const cube = c.split(',').map(i => parseInt(i))
		forEachSide(cube, sideCube => {
			const sideCubeStr = sideCube.join(',')
			if (!cubesSet.has(sideCubeStr)) {
				if (cond(sideCubeStr))
					sides++
			}
		})
	}


	return sides
}

function findOutsideCubes(cubesSet) {
	areaCube = [...cubesSet][0].split(',').map(c => [parseInt(c), parseInt(c) + 1])
	for (const c of cubesSet.values()) {
		const cube = c.split(',').map(i => parseInt(i))
		for (let i = 0; i < 3; i++) {
			coord = cube[i]
			if (coord < areaCube[i][0]) {
				areaCube[i][0] = coord
			} else if (coord + 1 > areaCube[i][1]) {
				areaCube[i][1] = coord + 1
			}
		}
	}

	for (let i = 0; i < 3; i++) {
		areaCube[i][0] -= 1
		areaCube[i][1] += 1
	}

	const outside = new Set()
	const cubesQueue = [areaCube.map(d => d[0])]
	while (cubesQueue.length > 0) {
		const cube = cubesQueue.pop()
		const cubeStr = cube.join(',')
		if (outside.has(cubeStr))
			continue

		outside.add(cubeStr)

		forEachSide(cube, sideCube => {
			for (let i = 0; i < 3; i++) {
				if (sideCube[i] < areaCube[i][0] || areaCube[i][1] < sideCube[i])
					return
			}
			const sideCubeStr = cube.join(',')
			if (!cubesSet.has(sideCubeStr)) {
				cubesQueue.push(sideCube)
			}
		})
	}

	return outside
}

fwk.part1(countSides(cubesMap))

const outside = findOutsideCubes(cubesMap)
fwk.part2(countSides(cubesMap, (cubeStr) => outside.has(cubeStr)))
