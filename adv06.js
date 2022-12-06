#!/usr/bin/env node

const fwk = new (require('./framework.js'))
const contents = fwk.readInput()

const START_OF_PACKET_MARKER_LENGTH = 4
const START_OF_MESSAGE_MARKER_LENGTH = 14

function findMarker(stream, markerLength) {
  for (let i = 0; i < stream.length; i++) {
    const characters = new Set(stream.substring(i, i + markerLength))
    if (characters.size == markerLength) {
      return i + markerLength
    }
  }

  throw (new Error('Marker not found'))
}

fwk.part1(findMarker(contents, START_OF_PACKET_MARKER_LENGTH))
fwk.part2(findMarker(contents, START_OF_MESSAGE_MARKER_LENGTH))
