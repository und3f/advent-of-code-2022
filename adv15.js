#!/usr/bin/env node
const fwk = new (require('./framework.js'))
const contents = fwk.readInput()

const re = /Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/g
const sensors = []
let r
while ((r = re.exec(contents)) !== null) {
	const v = r.slice(1, 5).map(i => parseInt(i))
	sensors.push({
		pos: [v[1], v[0]],
		beacon: [v[3], v[2]]
	})
}

sensors.forEach((sensor) => {
	sensor.radius = fwk.utils.manhattan(sensor.pos, sensor.beacon)
})

const calculateSensorCoverage = (sensor, y) => {
	const radiusMargin = sensor.radius - Math.abs(sensor.pos[0] - y)
	if (radiusMargin < 0) {
		return
	}

	const xBase = sensor.pos[1]
	return [xBase - radiusMargin, xBase + radiusMargin]
}

const normalizeCoverage = (coverages) => {
	const normalized = []
	coverages.sort((a, b) => a[0] - b[0])

	let current = coverages[0]
	for (let i = 1; i < coverages.length; i++) {
		const next = coverages[i]
		if (current[1] < next[0]) {
			normalized.push(current)
			current = next
		} else {
			current = [current[0], Math.max(current[1], next[1])]
		}
	}
	normalized.push(current)

	return normalized
}

const findCoverage = (sensors, y) =>
	normalizeCoverage(
		sensors
			.map(s => calculateSensorCoverage(s, y))
			.filter(s => s !== undefined)
	)

const findCoverageHole = (sensors, min, max) => {
	for (let y = min; y < max; y++) {
		const coverage = findCoverage(sensors, y)
		if (coverage.length > 1) {
			return [y, coverage[0][1] + 1]
		}

		if (coverage[0][0] > min)
			return [y, min]

		if (coverage[0][1] < max - 1) {
			return [y, coverage[0][1] + 1]
		}
	}
}

const calculateTuningFreq = (p) => {
	fwk.log('Found hole:', p)
	return p[1] * 4000000 + p[0]
}

const Y = 10
const MIN = 0
const MAX = 4000000

fwk.part1(findCoverage(sensors, Y).map(c => c[1] - c[0]).reduce((a, v) => a + v, 0))
fwk.part2(calculateTuningFreq(findCoverageHole(sensors, MIN, MAX)))
