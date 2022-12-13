#!/usr/bin/env node
const fwk = new (require('./framework.js'))
const contents = fwk.readInput()



fwk.part1()
fwk.part2()
