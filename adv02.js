#!/usr/bin/env node

const fwk = new (require('./framework.js'))

const rounds = fwk.readInput().split("\n").map(line => line.split(/\s+/))

const shapeScore = {
	A: 1,
	B: 2,
	C: 3,
	X: 1,
	Y: 2,
	Z: 3
}

const TOTAL_SHAPES = 3

const SCORE_LOSS = 0
const SCORE_DRAW = 3
const SCORE_WIN = 6

function getBeatingShapeScore(score) {
	return ((score - 1) + 1) % TOTAL_SHAPES + 1
}

function getLosingShapeScore(score) {
	return ((score - 1) - 1 + TOTAL_SHAPES) % TOTAL_SHAPES + 1
}

function calcRoundScore(shapeA, shapeB) {
	const scoreA = shapeScore[shapeA]
	const scoreB = shapeScore[shapeB]

	if (scoreA == scoreB)
		return SCORE_DRAW + scoreB;

	if (getBeatingShapeScore(scoreA) == scoreB)
		return SCORE_WIN + scoreB

	return scoreB
}

function calcDesiredRoundScore(shapeA, howRoundNeedsToEnd) {
	const scoreA = shapeScore[shapeA]
	switch (howRoundNeedsToEnd) {
		case "X":
			return SCORE_LOSS + getLosingShapeScore(scoreA)
		case "Y":
			return SCORE_DRAW + scoreA
		case "Z":
			return SCORE_WIN + getBeatingShapeScore(scoreA)
	}
}

function agregateRounds(rounds, scoreCalculator) {
	return rounds.map(round => scoreCalculator(round[0], round[1])).reduce((a, v) => a + v)
}

fwk.part1(agregateRounds(rounds, calcRoundScore))
fwk.part2(agregateRounds(rounds, calcDesiredRoundScore))