#!/usr/bin/env node
const PriorityQueue = require('priorityqueue')
const G = require('./graph')
const fwk = new (require('./framework.js'))
const contents = fwk.readInput()
const re = /^Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? (.+)$/

const START_VALVE = 'AA'
const MAX_TIME = 30
const MAX_PARALLEL_TIME = 26

const valvesObj = contents.split('\n').map(l => {
	const r = re.exec(l)
	return {
		name: r[1],
		flowRate: parseInt(r[2]),
		leadTo: r[3].split(', ')
	}
})

class State {
	constructor(valve, startTime = 1, openValves = new Set(), pressure = 0, totalReleasedPressure = 0, path = []) {
		this.valve = valve
		this.time = startTime
		this.openValves = openValves
		this.pressure = pressure
		this.totalReleasedPressure = totalReleasedPressure
		this.path = path.concat([[valve, startTime, totalReleasedPressure]])
	}

	openValve(travelTime, valveName, valvePressure) {
		const openValves = new Set(this.openValves)
		openValves.add(valveName)

		const pressure = this.pressure + valvePressure

		const totalTime = this.time + travelTime + 1

		return new State(valveName, totalTime, openValves, pressure, this.totalReleasedPressure + this.pressure * travelTime + pressure, this.path)
	}

	stay(time) {
		return new State(this.valve, this.time + time, this.openValve, this.pressure, this.totalReleasedPressure + this.pressure * time, this.path)
	}

	compareTo(state) {
		const timeCompare = this.time - state.time
		if (timeCompare !== 0) return timeCompare

		return this.totalReleasedPressure - state.totalReleasedPressure
	}
}

function astar(state, maxTime, valves, distances) {
	const totalValves = Object.keys(valves).length
	let bestPressure = 0
	const pq = new PriorityQueue.default({ comparator: (a, b) => a.compareTo(b) })
	pq.push(state)

	while (!pq.isEmpty()) {
		const s = pq.pop()
		// fwk.log(s)
		if (s.time >= maxTime || s.openValves.size === totalValves) {
			// console.log(s)
			const finalPressure = s.totalReleasedPressure + s.pressure * (maxTime - s.time)
			if (finalPressure > bestPressure) {
				// fwk.log('New best!', s, finalPressure)
				bestPressure = finalPressure
			}
			continue
		}

		const valvesToVisit = Object.keys(valves).filter(v => !s.openValves.has(v))
		// console.log(valvesToVisit)
		// s.nextStates().forEach((ns) => pq.push(ns))
		valvesToVisit.forEach((v) => {
			const nextState = s.openValve(distances[s.valve][v], v, valves[v].flowRate)
			if (nextState.time <= maxTime) {
				pq.push(nextState)
			} else {
				pq.push(s.stay(maxTime - s.time))
			}
		})
	}

	return bestPressure
}

class Graph {
	constructor(valves) {
		this.V = valves.length
		this.valves = valves
		const valveNameToV = this.valveNameToV = Object.fromEntries(valves.map((v, i) => [v.name, i]))
		this.adj = valves.map(v => new Set(
			v.leadTo.map(t => valveNameToV[t])
		))
	}

	getAdj(v) {
		return this.adj[v]
	}
}

function findValvesForVisit(valvesObj) {
	return Object.fromEntries(
		valvesObj.filter(v => v.flowRate > 0).map(v => [v.name, v])
	)
}

function calculateDistances(valves) {
	const g = new Graph((valvesObj))
	const valvesNames = Object.keys(valves)
	const sources = [...new Set([...valvesNames, START_VALVE])]
	return Object.fromEntries(sources.map(from => {
		const bfs = new G.BFS(g, g.valveNameToV[from])
		return [from, Object.fromEntries(
			valvesNames.filter(to => to !== from).map(to =>
				[to, bfs.distTo(g.valveNameToV[to])]
			)
		)]
	}))
}

function findBestTotalPressure(valves, maxTime) {
	const distances = calculateDistances(valves)
	return astar(new State(START_VALVE), maxTime, valves, distances)
}

function combination(valves, combination) {
	for (let index = 0; index < half; index++) {
		const startValue = index == 0 ? 0 : combination[index - 1]
		const endValue = total - half + index
		for (let indexValue = startValue; indexValue <= endValue; indexValue++) {
			combination[index] = valvesValues[indexValue]
			console.log(combination)
		}
	}
}

function findBestParallelPressure(valves, maxTime) {
	const valvesValues = Object.keys(valves)
	const distances = calculateDistances(valves)

	const total = valvesValues.length
	const half = Math.ceil(total / 2)

	const combination = new Array(half)

	return astar(new State(START_VALVE), maxTime, valves, distances)
}

const valves = findValvesForVisit(valvesObj)
fwk.part1(findBestTotalPressure(valves, MAX_TIME))
// fwk.part2(findBestParallelPressure(valves, MAX_PARALLEL_TIME))
