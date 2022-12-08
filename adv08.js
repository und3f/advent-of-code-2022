#!/usr/bin/env node
const fwk = new (require('./framework.js'))
const contents = fwk.readInput()

const trees = contents.split("\n").map(line => line.split("").map(h => parseInt(h)))

function initVisibility(height, width) {
  const visibility = new Array(trees.length).fill(null).map(
    line => new Array(trees.length).fill(false)
  )
  for (let x = 0; x < height; x++) {
    visibility[0][x] = true
    visibility[height - 1][x] = true
  }

  for (let y = 1; y < height - 1; y++) {
    visibility[y][0] = true
    visibility[y][width - 1] = true
  }
  return visibility
}

function findVisible(trees) {
  const height = trees.length
  const width = trees[0].length
  const visibility = initVisibility(height, width)

  for (let x = 0; x < width; x++) {
    let treeHeight = trees[0][x]
    for (let y = 1; y < height; y++) {
      if (trees[y][x] > treeHeight) {
        visibility[y][x] = true
        treeHeight = trees[y][x]
      }
    }

    treeHeight = trees[height - 1][x]
    for (let y = height - 2; y > 0; y--) {
      if (trees[y][x] > treeHeight) {
        visibility[y][x] = true
        treeHeight = trees[y][x]
      }
    }
  }

  for (let y = 0; y < height; y++) {
    let treeHeight = trees[y][0]
    for (let x = 1; x < width; x++) {
      if (trees[y][x] > treeHeight) {
        visibility[y][x] = true
        treeHeight = trees[y][x]
      }
    }

    treeHeight = trees[y][width - 1]
    for (let x = width - 2; x > 0; x--) {
      if (trees[y][x] > treeHeight) {
        visibility[y][x] = true
        treeHeight = trees[y][x]
      }
    }
  }

  return [].concat(...visibility).filter(a => a === true).length
}

function findScientificScore(trees, vy, vx) {
  const height = trees.length
  const width = trees[0].length

  const treeHeight = trees[vy][vx]

  let score = new Array(4).fill(0)
  for (let y = vy + 1; y < height; y++) {
    if (trees[y][vx] >= treeHeight) {
      score[0]++
      break
    }

    score[0]++
  }

  for (let y = vy - 1; y >= 0; y--) {
    if (trees[y][vx] >= treeHeight) {
      score[1]++
      break
    }

    score[1]++
  }

  for (let x = vx + 1; x < width; x++) {
    if (trees[vy][x] >= treeHeight) {
      score[2]++
      break
    }

    score[2]++
  }

  for (let x = vx - 1; x >= 0; x--) {
    if (trees[vy][x] >= treeHeight) {
      score[3]++
      break
    }

    score[3]++
  }

  return score.reduce((a, v) => a * v, 1)
}

function findBestScientificScore(trees) {
  const height = trees.length
  const width = trees[0].length

  let bestScore = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const score = findScientificScore(trees, y, x)
      bestScore = Math.max(bestScore, score)
    }
  }

  return bestScore
}

fwk.part1(findVisible(trees))
fwk.part2(findBestScientificScore(trees))
