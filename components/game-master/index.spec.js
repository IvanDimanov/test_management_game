/* global describe it expect beforeEach afterEach */
'use strict'

import GameMaster from './index.js'
import TodoQueue from '../todo-queue'
import Worker from '../worker'
import Issue from '../issue'

describe('GameMaster initialization', function () {
  beforeEach(function () {
    this.todoQueue = TodoQueue(5)
  })

  afterEach(function () {
    delete this.todoQueue
  })

  it('to be factory function', function () {
    expect(typeof GameMaster).toBe('function')
  })

  it('to throw on {Any} as invalid 1st argument "todoQueue"', function () {
    expect(() => GameMaster()).toThrowError(/1st argument/)
    expect(() => GameMaster('')).toThrowError(/1st argument/)
    expect(() => GameMaster(false)).toThrowError(/1st argument/)
    expect(() => GameMaster(null)).toThrowError(/1st argument/)
    expect(() => GameMaster({})).toThrowError(/1st argument/)
    expect(() => GameMaster([])).toThrowError(/1st argument/)
    expect(() => GameMaster(function () {})).toThrowError(/1st argument/)
    expect(() => GameMaster(new Date())).toThrowError(/1st argument/)
    expect(() => GameMaster(new RegExp())).toThrowError(/1st argument/)
  })

  it('to throw on {Any} as invalid 2nd argument "workerEmitter"', function () {
    expect(() => GameMaster(this.todoQueue)).toThrowError(/2nd argument/)
    expect(() => GameMaster(this.todoQueue, '')).toThrowError(/2nd argument/)
    expect(() => GameMaster(this.todoQueue, 'test')).toThrowError(/2nd argument/)
    expect(() => GameMaster(this.todoQueue, null)).toThrowError(/2nd argument/)
    expect(() => GameMaster(this.todoQueue, false)).toThrowError(/2nd argument/)
    expect(() => GameMaster(this.todoQueue, {})).toThrowError(/2nd argument/)
    expect(() => GameMaster(this.todoQueue, [])).toThrowError(/2nd argument/)
    expect(() => GameMaster(this.todoQueue, function () {})).toThrowError(/2nd argument/)
    expect(() => GameMaster(this.todoQueue, new Date())).toThrowError(/2nd argument/)
    expect(() => GameMaster(this.todoQueue, new RegExp())).toThrowError(/2nd argument/)
  })

  it('not to throw when correctly initialized', function () {
    const worker = Worker(5, 5)
    expect(() => GameMaster(this.todoQueue, worker.emitter)).not.toThrow()
  })
})

describe('GameMaster API', function () {
  beforeEach(function () {
    const todoQueue = TodoQueue(5)
    const worker = Worker(5, 5)
    this.gameMaster = GameMaster(todoQueue, worker.emitter)
  })

  afterEach(function () {
    this.gameMaster.stop()
    delete this.gameMaster
  })

  it('should have a {Function} "getDisapproval()"', function () {
    expect(typeof this.gameMaster.getDisapproval).toBe('function')
  })
  it('should have a {Function} "stop()"', function () {
    expect(typeof this.gameMaster.stop).toBe('function')
  })
  it('should have an {Object} "emitter"', function () {
    expect(typeof this.gameMaster.emitter).toBe('object')
  })
  it('should have a {Function} "emitter.on()"', function () {
    expect(typeof this.gameMaster.emitter.on).toBe('function')
  })
  it('should have a {Function} "emitter.once()"', function () {
    expect(typeof this.gameMaster.emitter.once).toBe('function')
  })
  it('should have a {Function} "emitter.off()"', function () {
    expect(typeof this.gameMaster.emitter.off).toBe('function')
  })
  it('should have a {Function} "emitter.removeListener()"', function () {
    expect(typeof this.gameMaster.emitter.removeListener).toBe('function')
  })

  it('should not throw after valid "getDisapproval()"', function () {
    expect(() => this.gameMaster.getDisapproval()).not.toThrow()
  })
  it('should not throw after valid "stop()"', function () {
    expect(() => this.gameMaster.stop()).not.toThrow()
  })
  it('should not throw after valid "emitter.on()"', function () {
    expect(() => this.gameMaster.emitter.on()).not.toThrow()
  })
  it('should not throw after valid "emitter.once()"', function () {
    expect(() => this.gameMaster.emitter.once()).not.toThrow()
  })
  it('should not throw after valid "emitter.off()"', function () {
    expect(() => this.gameMaster.emitter.off()).not.toThrow()
  })
  it('should not throw after valid "emitter.removeListener()"', function () {
    expect(() => this.gameMaster.emitter.removeListener()).not.toThrow()
  })
})

describe('GameMaster', function () {
  beforeEach(function () {
    this.todoQueue = TodoQueue(5)
    this.worker = Worker(5, 5)
    this.gameMaster = GameMaster(this.todoQueue, this.worker.emitter)
    this.issues = Array.from({length: 3})
      .map(() => Issue('Test Project', 1, 1))
  })

  afterEach(function () {
    this.gameMaster.stop()
    this.worker.stop()
    delete this.gameMaster
    delete this.todoQueue
    delete this.worker
    delete this.issues
  })

  it('should send events on "disapproval" update', function (done) {
    let totalEmits = 0
    function countEmits () {
      totalEmits++
    }

    this.gameMaster.emitter.on('disapproval/update', countEmits)
    this.todoQueue.push(Issue('Test Project', 1, 1))

    setTimeout(() => {
      this.gameMaster.emitter.off('disapproval/update', countEmits)
      expect(totalEmits).toBeGreaterThan(0)
      done()
    }, 3000)
  })

  it('"disapproval" should increase when there\'re "todo" issues', function (done) {
    const initialDisapproval = this.gameMaster.getDisapproval()
    this.gameMaster.emitter.once('disapproval/update', (disapproval) => {
      expect(disapproval).toBeGreaterThan(initialDisapproval)
      done()
    })

    this.issues
      .forEach((issue) => this.todoQueue.push(issue))
  })

  it('"disapproval" should decrease when there\'re less "todo" issues', function (done) {
    this.gameMaster.emitter.once('disapproval/update', (initialDisapproval) => {
      this.issues
        .forEach((issue) => {
          this.todoQueue.popById(issue.getId())
          issue.setStatus('dev')
          this.worker.queue.push(issue)
        })

      setTimeout(() => {
        const disapproval = this.gameMaster.getDisapproval()
        expect(disapproval).toBeLessThan(initialDisapproval)
        done()
      }, 2000)
    })

    this.issues
      .forEach((issue) => this.todoQueue.push(issue))
  })

  it('"disapproval" should not change after calling "stop()"', function (done) {
    this.gameMaster.emitter.once('disapproval/update', (initialDisapproval) => {
      this.gameMaster.stop()

      this.issues
        .forEach((issue) => {
          this.todoQueue.popById(issue.getId())
          issue.setStatus('dev')
          this.worker.queue.push(issue)
        })

      setTimeout(() => {
        const disapproval = this.gameMaster.getDisapproval()
        expect(disapproval).toBe(initialDisapproval)
        done()
      }, 2000)
    })

    this.issues
      .forEach((issue) => this.todoQueue.push(issue))
  })
})
