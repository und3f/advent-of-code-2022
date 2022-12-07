#!/usr/bin/env node

const fwk = new (require('./framework.js'))
const contents = fwk.readInput()

const commands = contents
  .split("$ ")
  .map(cmd => cmd.split("\n"))
commands.shift()

commands
  .map(cmd => { cmd[0] = cmd[0].split(' '); return cmd })

class Dir {
  constructor(parent, name) {
    this.parent = parent
    this.name = name
    this.folders = new Map()
    this.files = new Map()
    this.size = null
  }

  addFile(name, size) {
    this.files.set(name, {
      name: name,
      size: size
    })
  }

  addDir(name) {
    this.folders.set(name, new Dir(this, name))
  }

  getParent() { return this.parent }
  getDir(name) { return this.folders.get(name) }
  getDirs() { return this.folders.values() }

  getSize() {
    if (this.size == null) {
      this.size = 0
      for (const file of this.files.values()) {
        this.size += file.size
      }
      for (const dir of this.getDirs()) {
        this.size += dir.getSize()
      }
    }

    return this.size
  }

  print(level) {
    if (level === undefined) level = 0
    const prefix = " ".repeat(level + 1)
    const prefixThis = " ".repeat(level)
    console.log(`${prefixThis}${this.name} (dir)`)
    for (const dir of this.folders.values()) {
      dir.print(level + 1)
    }
    for (const file of this.files.values()) {
      console.log(`${prefix} ${file.name} (file, size=${file.size})`)
    }

  }
}

function traceFiles(commands) {
  const root = new Dir(null, '/')
  let cwd = root

  for (const commandAndOutput of commands) {
    const cmd = commandAndOutput.shift()
    const result = commandAndOutput
    switch (cmd[0]) {
      case 'cd':
        switch (cmd[1]) {
          case '/':
            cwd = root
            break;
          case '..':
            cwd = cwd.getParent()
            break;
          default:
            cwd = cwd.getDir(cmd[1])
            break;
        }
        break;
      case 'ls':
        for (const line of result) {
          if (line === '') continue
          const [type, name] = line.split(" ")
          if (type === 'dir') {
            cwd.addDir(name)
          } else {
            const size = parseInt(type)
            cwd.addFile(name, size)
          }
        }
        break;
    }
  }
  return root
}

function enumerateDirs(dir) {
  const dirs = []

  dirs.push(dir)

  for (const subDir of dir.getDirs()) {
    dirs.push(...enumerateDirs(subDir))
  }

  return dirs
}

const MAX_SIZE = 100000
const AVAILABLE_SIZE = 70000000
const REQUIRED_AVAILABLE_SIZE = 30000000

const root = traceFiles(commands)
const dirs = enumerateDirs(root)

const unusedSpace = AVAILABLE_SIZE - root.getSize()
const spacetoFree = REQUIRED_AVAILABLE_SIZE - unusedSpace

fwk.part1(dirs.filter(dir => dir.getSize() < MAX_SIZE).reduce((a, v) => a + v.getSize(), 0))
fwk.part2(dirs.filter(dir => dir.getSize() > spacetoFree).sort((a, b) => a.getSize() - b.getSize())[0].getSize())
