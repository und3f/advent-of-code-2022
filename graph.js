class BFS {
	constructor(g, s) {
		this.g = g
		this.s = s
		this.marked = new Set()
		this.edgeTo = new Array(g.V).fill(Number.NEGATIVE_INFINITY)

		this.bfs(s)
	}

	bfs(p) {
		this.marked.add(p)
		const queue = [p]

		while (queue.length > 0) {
			const v = queue.shift()

			for (const w of this.g.getAdj(v).values()) {
				if (!this.marked.has(w)) {
					this.edgeTo[w] = v
					this.marked.add(w)
					queue.push(w)
				}
			}
		}
	}

	isReachable(v) {
		return this.marked.has(v)
	}

	distTo(v) {
		if (!this.isReachable(v)) {
			throw (new Error(`Vertex ${v} is not reachable`))
		}

		let dist = 0
		while (v !== this.s) {
			dist++
			v = this.edgeTo[v]
		}
		return dist
	}
}

module.exports.BFS = BFS