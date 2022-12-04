#!/usr/bin/env node

const fwk = new (require('./framework.js'))
const contents = fwk.readInput().split('\n')

const pairs = contents.map(line => line.split(',').map(range => range.split('-').map(a => parseInt(a))))

function extract(arr, index) {
  return arr.map(item => item[index])
}

function findSat(arr, cond) {
  const set = new Set()
  const value = cond(...arr)
  arr.forEach((element, index) => {
    if (element === value)
      set.add(index)
  });

  return set
}

function findFullyOverlapping(pairs) {
  const fullyOverlappingPairs = []

  for (const pair of pairs) {
    const min = findSat(extract(pair, 0), Math.min)
    const max = findSat(extract(pair, 1), Math.max)
    const intersects = [...min].filter(i => max.has(i)).length > 0

    if (intersects) fullyOverlappingPairs.push(pair)
  }

  return fullyOverlappingPairs
}

function findOverlapping(pairs) {
  const overlappingPairs = []

  for (const pair of pairs) {
    const min = findSat(extract(pair, 0), Math.min)
    const max = findSat(extract(pair, 1), Math.max)

    if (pair[[...min][0]][1] >= pair[[...max][0]][0])
      overlappingPairs.push(pair)
  }

  return overlappingPairs
}


fwk.part1(findFullyOverlapping(pairs).length)
fwk.part2(findOverlapping(pairs).length)
