#!/usr/bin/env node
const fwk = new (require('./framework.js'))
const G = require('./graph')
const contents = fwk.readInput()
const maze = contents.split('\n').map(line => line.split(''))

class Graph {
	constructor(maze) {
		this.height = maze.length
		this.width = maze[0].length
		this.maze = maze
		fwk.log("Maze Dimensions", this.height, this.width)

		this.adj = new Array(this.height * this.width).fill(0).map(() => new Set())
		this.initEdges()
		fwk.log("Maze initialized")
	}

	initEdges() {
		const w = this.width
		const h = this.height
		const max = w * h - 1

		for (let i = max; i >= 0; i--) {
			const s = this.getV(i)
			if (s === 'S')
				this.start = i
			else if (s === 'E')
				this.end = i

			const addEdgeIfClimbable = (edge) => {
				if (this.isClimbable(s, this.getV(edge))) {
					this.adj[i].add(edge)
				}
			}

			if (i % w > 0)
				addEdgeIfClimbable(i - 1)

			if (i % w < w - 1)
				addEdgeIfClimbable(i + 1)

			if (i + w <= max)
				addEdgeIfClimbable(i + w)

			if (i - w >= 0)
				addEdgeIfClimbable(i - w)
		}

	}

	getV(i) {
		const x = i % this.width
		const y = (i - x) / this.width
		// fwk.log(i, y, x)

		return this.maze[y][x]
	}

	getAdj(i) {
		return this.adj[i]
	}

	isClimbable(from, to) {
		if (from === 'S')
			from = 'a'
		else if (from === 'E')
			from = 'z'

		if (to === 'S')
			to = 'a'
		else if (to === 'E')
			to = 'z'

		const fromH = from.charCodeAt()
		const toH = to.charCodeAt()
		return (Math.abs(fromH - toH) <= 1) || fromH > toH
	}
}

const g = new Graph(maze)
const bfs = new G.BFS(g, g.start)

function bestDist(g) {
	let bestDist = Number.POSITIVE_INFINITY
	for (let i = 0; i < g.width * g.height; i++) {
		const s = g.getV(i)
		if (s === 'a') {
			const bfs = new G.BFS(g, i)
			if (bfs.isReachable(g.end))
				bestDist = Math.min(bestDist, bfs.distTo(g.end))
		}
	}

	return bestDist
}

fwk.part1(bfs.distTo(g.end))
fwk.part2(bestDist(g, bfs))
