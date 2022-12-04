#!/usr/bin/env node

const fwk = new (require('./framework.js'))
const lines = fwk.readInput().split("\n")

const compartments = lines.map(
  (line) => {
    compartment_items = Math.floor(line.length / 2)
    return [
      line.substring(0, compartment_items),
      line.substring(compartment_items),
    ]
  }
)

function findIntersectionItem(compartments) {
  const compUnique = compartments.map(comp => new Set(comp.split('')))

  let unique = compUnique.shift()

  for (const comp of compUnique) {
    unique = new Set([...unique].filter(s => comp.has(s)))
  }

  if (unique.length > 1) {
    throw (new Error('Multiple intersection items'))
  }

  return [...unique][0]
}

const LOWERCASE_LETTER_START_PRIORITY = 1
const CAPITAL_LETTER_START_PRIORITY = 27

function itemPriority(item) {
  if (item.toLowerCase() === item) {
    return LOWERCASE_LETTER_START_PRIORITY + (item.charCodeAt() - 'a'.charCodeAt())
  }

  return CAPITAL_LETTER_START_PRIORITY + (item.charCodeAt() - 'A'.charCodeAt())
}

fwk.part1(compartments.map(findIntersectionItem).map(itemPriority).reduce((a, v) => a + v))

const GROUP_SIZE = 3
const badgeItems = []
for (let i = 0; i < lines.length; i += GROUP_SIZE) {
  badgeItems.push(findIntersectionItem(lines.slice(i, i + GROUP_SIZE)))
}

fwk.part2(badgeItems.map(itemPriority).reduce((a, v) => a + v, 0))
