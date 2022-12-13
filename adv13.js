#!/usr/bin/env node
const fwk = new (require('./framework.js'))
const contents = fwk.readInput()

const pairs = contents.split('\n\n').map(pair => pair.split('\n').map(JSON.parse))

function compare(a, b) {
	fwk.log('- Compare ', a, ' vs ', b)
	const isAArray = Array.isArray(a)
	const isBArray = Array.isArray(b)

	if (isAArray && isBArray) {
		for (let i = 0; i < a.length; i++) {
			if (i >= b.length)
				return 1
			const c = compare(a[i], b[i])
			if (c !== 0) {
				fwk.log(c)
				fwk.log(c < 0 ? 'In Right Order' : 'In Wrong Order')
				return c
			}
		}

		if (b.length > a.length)
			return -1
	} else if (!isAArray && !isBArray) {
		return a - b
	} else if (!isAArray) {
		return compare([a], b)
	} else if (!isBArray) {
		return compare(a, [b])
	}

	return 0
}

function sumIndicesOfRightOrderPackets(pairs) {
	let sum = 0
	for (let i = 0; i < pairs.length; i++) {
		fwk.log(`Next pair ${i}`)
		const pair = pairs[i]
		const c = compare(...pair)
		fwk.log(c)
		if (c < 0)
			sum += i + 1
	}

	return sum
}

function findProductOfDividerPackets(pairs) {
	const dividerPackets = [[[2]], [[6]]]
	const dividerPacketsStr = dividerPackets.map(JSON.stringify)

	const packets = pairs.flat(1).concat(dividerPackets)
	packets.sort(compare)

	const dividerPacketsIndices = []
	for (let i = 0; i < packets.length; i++) {
		if (dividerPacketsStr.indexOf(JSON.stringify(packets[i])) >= 0) {
			dividerPacketsIndices.push(i + 1)
		}
	}

	return dividerPacketsIndices.reduce((a, b) => a * b, 1)
}

fwk.part1(sumIndicesOfRightOrderPackets(pairs))
fwk.part2(findProductOfDividerPackets(pairs))
