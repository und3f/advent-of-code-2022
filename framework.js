const fs = require("fs")
const path = require("path")
const clc = require("cli-color");

module.exports = class Framework {
  constructor() {
    this.day = path.basename(require.main.filename, ".js")
    this.log = process.env['DEBUG'] ? console.log : () => { }

    const outputStyle = clc.bgXterm(226)
    this.resultOutput = (partN, result) => {
      process.stdout.write(`Part ${partN}: ${outputStyle(result)}\n`)
    }
  }

  readInput() {
    return fs
      .readFileSync(`${this.day}.txt`, "utf8")
      .trimEnd()
  }

  part1(out) {
    this.resultOutput(1, out)
  }

  part2(out) {
    this.resultOutput(2, out)
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
    },
    manhattan: (a, b) => {
      if (!Array.isArray(a) || !Array.isArray(b))
        throw (new Error('Invalid input'))

      if (a.length !== b.length)
        throw (new Error('Inequal position dimensions'))

      let distance = 0
      for (let i = 0; i < a.length; i++) {
        distance += Math.abs(a[i] - b[i])
      }

      return distance
    }
  }
}
