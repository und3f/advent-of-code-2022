#!/usr/bin/env node
const fwk = new (require('./framework.js'))
const contents = fwk.readInput()
const arrangement = contents.split('\n').map(i => parseInt(i))

function mix(origin, arr, index) {
	const number = arr[index]

	const pairMod = origin.length - 1
	let newPosition = (index + origin[number] % pairMod + pairMod) % pairMod

	const numberless = arr.slice(0, index).concat(arr.slice(index + 1))
	return numberless.slice(0, newPosition).concat([number, ...numberless.slice(newPosition)])
}

function mixArray(origin, arr) {
	if (arr === undefined) {
		arr = new Array(origin.length).fill(0).map((undefined, i) => i)
	}

	for (let i = 0; i < origin.length; i++) {
		const index = arr.indexOf(i)
		arr = mix(origin, arr, index)
		fwk.log({ arr: arr.map(v => origin[v]), i })
	}

	return arr
}

function decryptMix(origin, arr) {
	return arr.map(v => origin[v])
}

function getNthNumber(arr, index, offset) {
	return arr[(index + offset) % arr.length]
}

const groveOffsets = [1000, 2000, 3000]

function calculateGroveCoordinate(arr) {
	const zeroIndex = arr.indexOf(0)

	return groveOffsets.map(offset => getNthNumber(arr, zeroIndex, offset)).reduce((a, v) => a + v, 0)
}

function decryptGroveCoordinate(originRaw, decryptionKey = 1, rounds = 1) {
	let origin = originRaw.map(v => v * decryptionKey)
	let arr
	fwk.log('Initial:', arr)
	for (let i = 0; i < rounds; i++) {
		arr = mixArray(origin, arr)
		fwk.log(`Round ${i + 1}:`, decryptMix(origin, arr))
	}

	return calculateGroveCoordinate(decryptMix(origin, arr))
}

const DECRYPTION_KEY = 811589153
const ROUNDS = 10

fwk.part1(decryptGroveCoordinate(arrangement))
fwk.part2(decryptGroveCoordinate(arrangement, DECRYPTION_KEY, ROUNDS))
