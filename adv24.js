#!/usr/bin/env node
const fwk = new (require('./framework.js'))
const contents = fwk.readInput()

symToVector = {
  'v': [1, 0],
  '^': [-1, 0],
  '>': [0, 1],
  '<': [0, -1],
  'w': [0, 0],
}

class Blizzard {
  constructor(position, vector, sym) {
    this.position = position
    this.vector = vector
    this.sym = sym
  }
}

class Basin {
  constructor(text) {
    const lines = text.split("\n")

    this.width = text.indexOf("\n")
    this.height = Math.ceil(text.length / (this.width + 1))

    this.startPos = [0, 1]
    this.start = this.pos2Index(this.startPos)
    this.endPos = [this.height - 1, this.width - 2]
    this.end = this.pos2Index(this.endPos)

    this.statesCache = new Map()

    this.blizzards = new Array()
    for (let i = 1; i < text.length; i++) {
      const s = text.charAt(i)
      if (s in symToVector) {
        const v = symToVector[s]
        this.blizzards.push(new Blizzard(this.textIndex2Pos(i), v, s))
      }
    }

    this.cycle = this.findCycle()
  }

  simulateBlizzards(time) {
    return this.blizzards.map(b => {
      return fwk.utils.addVectors(
        fwk.utils.modVectors(
          fwk.utils.addVectors(
            fwk.utils.addVectors(b.position, [-1, -1]),
            fwk.utils.mulVector(b.vector, time)
          ),
          [this.height - 2, this.width - 2]
        ),
      [1, 1]
      )
    })
  }

  _occupiedIndeces(time) {
    return new Set(this.simulateBlizzards(time).map(pos => this.pos2Index(pos)))
  }

  getState(realTime) {
    const time = realTime % this.cycle
    if (this.statesCache.has(time)) {
      return this.statesCache.get(time)
    }

    const state = this._occupiedIndeces(time)
    this.statesCache.set(time, state)
    return state
  }

  expireCacheBefore(time) {
    for (let i = time; i >= 0; i--) {
      if (!this.statesCache.has(i)) return;

      this.statesCache.delete(i)
    }
  }

  possibleMoves(pos, time) {
    const obstacles = this.getState(time)

    return Object.values(symToVector).map(
      vec => fwk.utils.addVectors(pos, vec)
    ).filter(
      pos => {
        const i = this.pos2Index(pos)

        if (i == this.end) return true

        if (obstacles.has(i)) return false

        if (pos[0] <= 0 || pos[0] >= this.height-1) return false
        if (pos[1] <= 0 || pos[1] >= this.width-1) return false

        return true
      }
    )
  }

  swapDest() {
    const {startPos, start, endPos, end} = this
    this.startPos = endPos
    this.start = end
    this.endPos = startPos
    this.end = start
  }

  findCycle() {
    const initial = JSON.stringify(this.simulateBlizzards(0))
    for (let time = 1; time < 1000; time++) {
      const state = JSON.stringify(this.simulateBlizzards(time))
      if (state == initial) {
        return time
      }
    }

    return undefined
  }


  pos2Index(pos) {
    return pos[0] * this.width + pos[1]
  }

  timePos2Index(time, pos) {
    return (time % this.cycle) * this.width * this.height + this.pos2Index(pos)
  }

  index2Pos(index) {
    return [Math.floor(index / this.width), index % this.width]
  }

  textIndex2Pos(index) {
    return [Math.floor(index / (this.width + 1)), index % (this.width + 1) ]
  }

  toString(time, pos) {
    const out = ["#".repeat(this.width).split('')]
    
    for (let i = 1; i < this.height - 1; i++) {
      out.push(("#" + ".".repeat(this.width - 2) + "#").split(''))
    }

    out.push("#".repeat(this.width).split(''))

    this.simulateBlizzards(time).forEach((pos, i) => {
      const prev = out[pos[0]][pos[1]]
      let next = '.'
      if (prev == '.') {
        next = this.blizzards[i].sym
      } else if (prev == '+') {
        next = prev
      } else if (prev >= '1' && prev <= '9') {
        next = prev + 1
      } else {
        next = 2
      }

      out[pos[0]][pos[1]] = next
    });

    [this.start, this.end]
      .map(i => this.index2Pos(i))
      .forEach(p => out[p[0]][p[1]] = '.')

    if (pos !== undefined) {
      out[pos[0]][pos[1]] = 'E'
    }

    return out.map(l => l.join('')).join("\n")
  }
}

const basin = new Basin(contents)

const findShortestPathWithTimeOffset = (basin, startTime, visited, bestSolution) => {
  const states = [[
    startTime,
    basin.startPos,
  ]]

  while(states.length > 0) {
    const [time, pos, optimisticEst] = states.shift()
    if (optimisticEst >= bestSolution) continue;

    const timePosIndex = basin.timePos2Index(time, pos)
    if (visited.has(timePosIndex)) continue;
    visited.add(timePosIndex)

    const moves = basin.possibleMoves(pos, time)
    for (const pos of moves) {
      const i = basin.pos2Index(pos)
      if (i == basin.end) {
        fwk.log(`Found solution ${time}`)
        bestSolution = time
        continue
      }

      const state = [
        time + 1,
        pos,
        time + 1 + fwk.utils.manhattan(pos, basin.endPos)
      ]
      if (state[2] >= bestSolution) continue;

      states.push(state)
    }

    // Hack for implementing minHeap
    states.sort((a, b) => a[2] - b[2])
  }

  return bestSolution
}

const findShortestPath = (basin, startTime) => {
  const maxTime = startTime + basin.cycle
  const visited = new Set()
  const directTravelDistance = fwk.utils.manhattan(basin.startPos, basin.endPos)
  let bestSolution = Infinity

  for (let time = startTime; time < maxTime && time + directTravelDistance < bestSolution; time++) {
    basin.expireCacheBefore(time)
    fwk.log({time})
    bestSolution = findShortestPathWithTimeOffset(basin, time, visited, bestSolution)
  }

  return bestSolution
}

const forthReachTime = findShortestPath(basin, 1)
fwk.part1(forthReachTime)

basin.swapDest()
const returnReachTime = findShortestPath(basin, forthReachTime + 1)

basin.swapDest()
fwk.part2(findShortestPath(basin, returnReachTime + 1))
