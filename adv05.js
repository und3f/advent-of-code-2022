#!/usr/bin/env node

const fwk = new (require('./framework.js'))
const [stacksString, procedureString] = fwk.readInput().split("\n\n")

const procedures = procedureString.trim().split("\n").map(line => {
  const entities = line.split(" ")
  return {
    amount: parseInt(entities[1]),
    source: parseInt(entities[3]) - 1,
    destination: parseInt(entities[5]) - 1
  }
})

const stacksStringLines = stacksString.split("\n")
const numberOfStacks = parseInt(stacksStringLines.pop().trim().split(" ").pop())
const stacks = new Array(numberOfStacks)
for (let i = 0; i < numberOfStacks; i++)
  stacks[i] = []

function isAlphabet(str) {
  return /^[a-zA-Z]+$/.test(str);
}

for (const line of stacksStringLines) {
  for (let i = 0; i < numberOfStacks; i++) {
    let letter = line.charAt(1 + i * 4)
    if (isAlphabet(letter)) {
      stacks[i].push(letter)
    }
  }
}

function arrangeStacks(stacksOrigin, procedures, arrangement) {
  const stacks = stacksOrigin.map(stack => new Array(...stack))
  for (const procedure of procedures) {
    arrangement(stacks, procedure)
  }
  return stacks.map(stack => stack[0]).join('')
}

const arrangeMoveSingle = (stacks, procedure) => {
  for (let i = procedure.amount; i > 0; i--) {
    stacks[procedure.destination].unshift(stacks[procedure.source].shift())
  }
}
const arrangeMoveMultipleAtOnce = (stacks, procedure) => {
  stacks[procedure.destination].unshift(
    ...stacks[procedure.source].splice(0, procedure.amount)
  )
}

fwk.part1(arrangeStacks(stacks, procedures, arrangeMoveSingle))
fwk.part2(arrangeStacks(stacks, procedures, arrangeMoveMultipleAtOnce))
