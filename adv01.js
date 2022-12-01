#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const contents = fs
  .readFileSync(path.basename(__filename, ".js") + ".txt", "utf8")
  .trim()

const elves = contents.split("\n\n")
  .map(
    elf => elf.split("\n").map(c => parseInt(c)).reduce((a, v) => a + v, 0)
  )

elves.sort((a, b) => b - a)

console.log("Part 1: ", elves[0])
console.log("Part 2: ", elves.slice(0, 3).reduce((a, v) => a + v))
