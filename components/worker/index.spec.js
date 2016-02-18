/* global describe it expect beforeEach afterEach */
'use strict'

import Worker from './index.js'
import Issue from '../issue'

describe('Worker initialization', function () {
  it('to be factory function', function () {
    expect(typeof Worker).toBe('function')
  })

  it('to throw on {Any} as invalid 1st argument "maxActiveIssues"', function () {
    expect(() => Worker()).toThrowError(/1st argument/)
    expect(() => Worker('')).toThrowError(/1st argument/)
    expect(() => Worker(false)).toThrowError(/1st argument/)
    expect(() => Worker(null)).toThrowError(/1st argument/)
    expect(() => Worker({})).toThrowError(/1st argument/)
    expect(() => Worker([])).toThrowError(/1st argument/)
    expect(() => Worker(function () {})).toThrowError(/1st argument/)
    expect(() => Worker(new Date())).toThrowError(/1st argument/)
    expect(() => Worker(new RegExp())).toThrowError(/1st argument/)
  })

  it('to throw on negative {Number} as invalid 1st argument "maxActiveIssues"', function () {
    expect(() => Worker(-1)).toThrowError(/1st argument/)
  })

  it('to throw on {Any} as invalid 2nd argument "workPoints"', function () {
    expect(() => Worker(5)).toThrowError(/2nd argument/)
    expect(() => Worker(5, '')).toThrowError(/2nd argument/)
    expect(() => Worker(5, 'test')).toThrowError(/2nd argument/)
    expect(() => Worker(5, null)).toThrowError(/2nd argument/)
    expect(() => Worker(5, false)).toThrowError(/2nd argument/)
    expect(() => Worker(5, {})).toThrowError(/2nd argument/)
    expect(() => Worker(5, [])).toThrowError(/2nd argument/)
    expect(() => Worker(5, function () {})).toThrowError(/2nd argument/)
    expect(() => Worker(5, new Date())).toThrowError(/2nd argument/)
    expect(() => Worker(5, new RegExp())).toThrowError(/2nd argument/)
  })

  it('to throw on negative {Number} as invalid 2nd argument "workPoints"', function () {
    expect(() => Worker(5, -1)).toThrowError(/2nd argument/)
  })

  it('not to throw when correctly initialized', function () {
    expect(() => Worker(1, 1)).not.toThrow()
    expect(() => Worker(5, 2.2)).not.toThrow()
    expect(() => Worker(7, 0.005)).not.toThrow()
  })
})

describe('Worker API', function () {
  beforeEach(function () {
    this.worker = Worker(5, 5)
  })

  afterEach(function () {
    this.worker.stop()
    delete this.worker
  })

  it('should have a valid function "getId()"', function () {
    expect(typeof this.worker.getId).toBe('function')
  })
  it('should have a valid function "stop()"', function () {
    expect(typeof this.worker.stop).toBe('function')
  })
  it('should have a valid function "toString()"', function () {
    expect(typeof this.worker.toString).toBe('function')
  })

  it('should not throw after valid "getId()"', function () {
    expect(() => this.worker.getId()).not.toThrow()
  })
  it('should not throw after valid "stop()"', function () {
    expect(() => this.worker.stop()).not.toThrow()
  })
  it('should not throw after valid "toString()"', function () {
    expect(() => this.worker.toString()).not.toThrow()
  })

  it('should return non-empty {String} after calling "toString()"', function () {
    expect(typeof this.worker.toString()).toBe('string')
    expect(this.worker.toString().length).toBeGreaterThan(0)
  })
})

describe('Worker queue API', function () {
  beforeEach(function () {
    this.worker = Worker(5, 5)
    this.devIssue = Issue('Test project', 1, 1)
    this.devIssue.setStatus('dev')
  })

  afterEach(function () {
    this.worker.stop()
    delete this.worker
    delete this.devIssue
  })

  it('should be a valid {Object} "queue"', function () {
    expect(typeof this.worker.queue).toBe('object')
  })
  it('should have a valid API function "queue.push()"', function () {
    expect(typeof this.worker.queue.push).toBe('function')
  })
  it('should have a valid API function "queue.popById()"', function () {
    expect(typeof this.worker.queue.popById).toBe('function')
  })

  it('should not throw after valid "queue.push()"', function () {
    expect(() => this.worker.queue.push(this.devIssue)).not.toThrow()
  })
  it('should not throw after valid "queue.popById()"', function () {
    this.worker.queue.push(this.devIssue)
    expect(() => this.worker.queue.popById(this.devIssue.getId())).not.toThrow()
  })
})

describe('Worker', function () {
  beforeEach(function () {
    this.worker = Worker(5, 5)
    this.devIssue = Issue('Test Project', 1, 1)
    this.devIssue.setStatus('dev')
  })

  afterEach(function () {
    this.worker.stop()
    delete this.worker
    delete this.devIssue
  })

  it('queue should throw when pushing non-"dev" issues', function () {
    const todoIssue = Issue('Test Project', 1, 1)
    todoIssue.setStatus('todo')
    expect(() => this.worker.queue.push(todoIssue)).toThrowError(/1st argument/)
  })

  it('queue should not throw when pushing "dev" issues', function () {
    expect(() => this.worker.queue.push(this.devIssue)).not.toThrow()
  })

  it('should work fast with less complex issues', function (done) {
    this.worker.queue.push(this.devIssue)
    expect(this.worker.queue.getSize()).toBe(1)
    setTimeout(() => {
      expect(this.worker.queue.getSize()).toBe(0)
      done()
    }, 100)
  })

  it('should work slower with more complex issues', function (done) {
    const devIssue = Issue('Test Project', 1, 10)
    devIssue.setStatus('dev')
    this.worker.queue.push(devIssue)
    expect(this.worker.queue.getSize()).toBe(1)
    setTimeout(() => {
      expect(this.worker.queue.getSize()).toBe(1)
      done()
    }, 100)
  })

  it('should stop "working" after a call to "stop()"', function (done) {
    let totalEmits = 0
    function countEmits () {
      totalEmits++
    }
    this.worker.emitter.on('issue/pop', countEmits)

    const devIssue1 = Issue('Test Project', 1, 1)
    devIssue1.setStatus('dev')
    this.worker.queue.push(devIssue1)

    const devIssue2 = Issue('Test Project', 2, 10)
    devIssue2.setStatus('dev')
    this.worker.queue.push(devIssue2)

    /* Wait till only the 1st issues is been completed */
    setTimeout(() => {
      this.worker.stop()
    }, 100)

    setTimeout(() => {
      this.worker.emitter.off('issue/pop', countEmits)
      expect(totalEmits).toBe(1)
      done()
    }, 2000)
  })
})

describe('Worker emitter API', function () {
  beforeEach(function () {
    this.worker = Worker(5, 5)
    this.devIssue = Issue('Test project', 1, 1)
    this.devIssue.setStatus('dev')
  })

  afterEach(function () {
    this.worker.stop()
    delete this.worker
    delete this.devIssue
  })

  it('should be a valid {Object} "emitter"', function () {
    expect(typeof this.worker.emitter).toBe('object')
  })
  it('should have a valid API function "emitter.on()"', function () {
    expect(typeof this.worker.emitter.on).toBe('function')
  })
  it('should have a valid API function "emitter.once()"', function () {
    expect(typeof this.worker.emitter.once).toBe('function')
  })
  it('should have a valid API function "emitter.off()"', function () {
    expect(typeof this.worker.emitter.off).toBe('function')
  })

  it('should send event when an issue is been added', function (done) {
    let totalEmits = 0
    this.worker.emitter.once('issue/push', () => totalEmits++)
    this.worker.queue.push(this.devIssue)
    setTimeout(() => {
      expect(totalEmits).toBe(1)
      done()
    }, 100)
  })

  it('should send event when an issue is been worked on', function (done) {
    let totalEmits = 0
    this.worker.emitter.once('issue/work', () => totalEmits++)
    this.worker.queue.push(this.devIssue)
    setTimeout(() => {
      expect(totalEmits).toBe(1)
      done()
    }, 100)
  })

  it('should send "stress" event when a Worker "work" over more than one issue', function (done) {
    let totalEmits = 0
    this.worker.emitter.once('worker/stress', () => totalEmits++)
    this.worker.queue.push(this.devIssue)

    const devIssue = Issue('Test Project', 1, 10)
    devIssue.setStatus('dev')
    this.worker.queue.push(devIssue)

    setTimeout(() => {
      expect(totalEmits).toBe(1)
      done()
    }, 100)
  })

  it('should send event when an issue is been completed', function (done) {
    let totalEmits = 0
    this.worker.emitter.once('issue/pop', () => totalEmits++)
    this.worker.queue.push(this.devIssue)
    setTimeout(() => {
      expect(totalEmits).toBe(1)
      done()
    }, 100)
  })
})
