const fs = require("fs")
const path = require("path")

module.exports = class Framework {
  constructor() {
    this.day = path.basename(require.main.filename, ".js")
  }

  readInput() {
    return fs
      .readFileSync(`${this.day}.txt`, "utf8")
      .trim()
  }

  part1(out) {
    console.log(`Part 1: ${out}`)
  }

  part2(out) {
    console.log(`Part 2: ${out}`)
  }
}
