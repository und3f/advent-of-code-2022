const fs = require("fs")
const path = require("path")

module.exports = class Framework {
  constructor() {
    this.day = path.basename(require.main.filename, ".js")
    this.log = process.env['DEBUG'] ? this.doLog : () => { }
  }

  readInput() {
    return fs
      .readFileSync(`${this.day}.txt`, "utf8")
      .trimEnd()
  }

  part1(out) {
    console.log(`Part 1: ${out}`)
  }

  part2(out) {
    console.log(`Part 2: ${out}`)
  }

  doLog(...args) {
    console.log(...args)
  }

  utils = {
    gcd: (a, b) => {
      return !b ? a : this.utils.gcd(b, a % b);
    },
    lcm: (a, b) => {
      return (a * b) / this.utils.gcd(a, b);
    },
    arrayLCM: (arr) => {
      return arr.reduce((a, v) => this.utils.lcm(a, v), 1)
    },
    camelize: (str) => {
      return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      }).replace(/\s+/g, '');
    }
  }
}
