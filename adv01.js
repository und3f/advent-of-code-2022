#!/usr/bin/env node

const fwk = new (require('./framework.js'))
const contents = fwk.readInput()

const elves = contents.split("\n\n").map(
  elf => elf.split("\n").map(c => parseInt(c)).reduce((a, v) => a + v, 0)
)

elves.sort((a, b) => b - a)

fwk.part1(elves[0])
fwk.part2(elves.slice(0, 3).reduce((a, v) => a + v))
