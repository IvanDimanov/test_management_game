/* global describe it expect beforeEach afterEach */
'use strict'

import Queue from './index.js'
import Issue from '../issue'

describe('Queue initialization', function () {
  it('to be factory function', function () {
    expect(typeof Queue).toBe('function')
  })

  it('to throw on {Any} as invalid 1st argument "allowedIssueStatus"', function () {
    expect(() => Queue()).toThrowError(/1st argument/)
    expect(() => Queue('')).toThrowError(/1st argument/)
    expect(() => Queue('test')).toThrowError(/1st argument/)
    expect(() => Queue(false)).toThrowError(/1st argument/)
    expect(() => Queue(null)).toThrowError(/1st argument/)
    expect(() => Queue({})).toThrowError(/1st argument/)
    expect(() => Queue([])).toThrowError(/1st argument/)
    expect(() => Queue(function () {})).toThrowError(/1st argument/)
    expect(() => Queue(new Date())).toThrowError(/1st argument/)
    expect(() => Queue(new RegExp())).toThrowError(/1st argument/)
  })

  it('to throw on {Any} as invalid 2nd argument "maxSize"', function () {
    expect(() => Queue('todo')).toThrowError(/2nd argument/)
    expect(() => Queue('todo', '')).toThrowError(/2nd argument/)
    expect(() => Queue('todo', 'test')).toThrowError(/2nd argument/)
    expect(() => Queue('todo', null)).toThrowError(/2nd argument/)
    expect(() => Queue('todo', false)).toThrowError(/2nd argument/)
    expect(() => Queue('todo', {})).toThrowError(/2nd argument/)
    expect(() => Queue('todo', [])).toThrowError(/2nd argument/)
    expect(() => Queue('todo', function () {})).toThrowError(/2nd argument/)
    expect(() => Queue('todo', new Date())).toThrowError(/2nd argument/)
    expect(() => Queue('todo', new RegExp())).toThrowError(/2nd argument/)
  })

  it('to throw on negative {Number} as invalid 2nd argument "maxSize"', function () {
    expect(() => Queue('todo', -1)).toThrowError(/2nd argument/)
  })

  it('to throw on {Any} as invalid 3rd argument "allowedToEmit"', function () {
    expect(() => Queue('todo', 7, '')).toThrowError(/3rd argument/)
    expect(() => Queue('todo', 7, 'test')).toThrowError(/3rd argument/)
    expect(() => Queue('todo', 7, null)).toThrowError(/3rd argument/)
    expect(() => Queue('todo', 7, {})).toThrowError(/3rd argument/)
    expect(() => Queue('todo', 7, [])).toThrowError(/3rd argument/)
    expect(() => Queue('todo', 7, function () {})).toThrowError(/3rd argument/)
    expect(() => Queue('todo', 7, new Date())).toThrowError(/3rd argument/)
    expect(() => Queue('todo', 7, new RegExp())).toThrowError(/3rd argument/)
  })

  it('not to throw when correctly initialized', function () {
    expect(() => Queue('todo', 1)).not.toThrow()
    expect(() => Queue('dev', 2, true)).not.toThrow()
    expect(() => Queue('done', 3, false)).not.toThrow()
  })
})

describe('Queue', function () {
  const maxSize = 5

  beforeEach(function () {
    this.queue = Queue('todo', maxSize)
    this.issues = Array.from({length: 3})
      .map((value, index) => Issue('Test Project', index + 1, index + 1))
  })

  afterEach(function () {
    delete this.queue
    delete this.issues
  })

  it('have a valid API of functions: "push()", "popById()", "getSize()", "getMaxSize()", "getIssues()"', function () {
    expect(typeof this.queue.push).toBe('function')
    expect(typeof this.queue.popById).toBe('function')
    expect(typeof this.queue.getSize).toBe('function')
    expect(typeof this.queue.getMaxSize).toBe('function')
    expect(typeof this.queue.getIssues).toBe('function')
  })

  it('should not throw after valid "push()"', function () {
    expect(() => this.queue.push(this.issues[0])).not.toThrow()
  })

  it('should not throw after valid "push()" and "popById()"', function () {
    expect(() => this.queue.push(this.issues[0])).not.toThrow()
    expect(() => this.queue.popById(this.issues[0].getId())).not.toThrow()
  })

  it('should not throw after calling "getSize()"', function () {
    expect(() => this.queue.getSize()).not.toThrow()
  })

  it('should not throw after calling "getMaxSize()"', function () {
    expect(() => this.queue.getMaxSize()).not.toThrow()
  })

  it('should not throw after calling "getIssues()"', function () {
    expect(() => this.queue.getIssues()).not.toThrow()
  })

  it('should main total number of issues after "push()"', function () {
    expect(this.queue.getSize()).toBe(0)
    this.queue.push(this.issues[0])
    this.queue.push(this.issues[1])
    this.queue.push(this.issues[2])
    expect(this.queue.getSize()).toBe(3)
  })

  it('should main total number of issues after "push()" and "popById()"', function () {
    expect(this.queue.getSize()).toBe(0)
    this.queue.push(this.issues[0])
    this.queue.push(this.issues[1])
    this.queue.push(this.issues[2])
    this.queue.popById(this.issues[0].getId())
    this.queue.popById(this.issues[1].getId())
    this.queue.popById(this.issues[2].getId())
    expect(this.queue.getSize()).toBe(0)
  })

  it('should throw on pushing more issues that max value', function () {
    Array.from({length: maxSize})
      .map((value, index) => Issue('Test Project', 1, 1))
      .forEach((issue) => this.queue.push(issue))

    expect(() => this.queue.push(this.issues[0])).toThrowError(/max size/i)
  })

  it('should throw when calling "popById()" with unknown id', function () {
    expect(() => this.queue.popById('unknown')).toThrowError(/do not exist/i)
  })

  it('should return {Array} of length 0 when calling "getIssues()" before pushing any issues', function () {
    expect(this.queue.getIssues() instanceof Array).toBe(true)
    expect(this.queue.getIssues().length).toBe(0)
  })

  it('should return {Array} of length 3 when calling "getIssues()" after pushing 3 issues', function () {
    this.queue.push(this.issues[0])
    this.queue.push(this.issues[1])
    this.queue.push(this.issues[2])
    expect(this.queue.getIssues().length).toBe(3)
  })
})

describe('Queue emitter', function () {
  const maxSize = 5

  beforeEach(function () {
    this.queueNotTriggering = Queue('todo', maxSize)
    this.queueTriggering = Queue('todo', maxSize, true)
    this.issues = Array.from({length: 3})
      .map((value, index) => Issue('Test Project', index + 1, index + 1))
  })

  afterEach(function () {
    delete this.queueNotTriggering
    delete this.queueTriggering
    delete this.issues
  })

  it('should have functions "once()", "on()", "off()", "removeListener()" when created without the option to trigger events', function () {
    expect(typeof this.queueNotTriggering.emitter).toBe('object')
    expect(typeof this.queueNotTriggering.emitter.once).toBe('function')
    expect(typeof this.queueNotTriggering.emitter.on).toBe('function')
    expect(typeof this.queueNotTriggering.emitter.off).toBe('function')
    expect(typeof this.queueNotTriggering.emitter.removeListener).toBe('function')
  })

  it('should have functions "once()", "on()", "off()", "removeListener()" when created with the option to trigger events', function () {
    expect(typeof this.queueTriggering.emitter).toBe('object')
    expect(typeof this.queueTriggering.emitter.once).toBe('function')
    expect(typeof this.queueTriggering.emitter.on).toBe('function')
    expect(typeof this.queueTriggering.emitter.off).toBe('function')
    expect(typeof this.queueTriggering.emitter.removeListener).toBe('function')
  })

  it('should emit events when new issues are pushed', function () {
    let totalEmits = 0
    this.queueNotTriggering.emitter.once('issue/push', () => totalEmits++)
    this.queueNotTriggering.emitter.once('issue/push', () => totalEmits++)
    this.queueNotTriggering.emitter.once('issue/push', () => totalEmits++)
    this.queueNotTriggering.push(this.issues[0])

    setTimeout(() => expect(totalEmits).toBe(3), 100)
  })

  it('should emit events when pushed issues are poped', function () {
    this.queueNotTriggering.push(this.issues[0])
    this.queueNotTriggering.push(this.issues[1])
    this.queueNotTriggering.push(this.issues[2])

    let totalEmits = 0
    this.queueNotTriggering.emitter.once('issue/pop', () => totalEmits++)
    this.queueNotTriggering.popById(this.issues[0].getId())

    this.queueNotTriggering.emitter.once('issue/pop', () => totalEmits++)
    this.queueNotTriggering.popById(this.issues[1].getId())

    this.queueNotTriggering.emitter.once('issue/pop', () => totalEmits++)
    this.queueNotTriggering.popById(this.issues[2].getId())

    setTimeout(() => expect(totalEmits).toBe(3), 100)
  })
})

describe('Queue triggering emitter', function () {
  const maxSize = 5

  beforeEach(function () {
    this.queueNotTriggering = Queue('todo', maxSize)
    this.queueTriggering = Queue('todo', maxSize, true)
    this.issues = Array.from({length: 3})
      .map((value, index) => Issue('Test Project', index + 1, index + 1))
  })

  afterEach(function () {
    delete this.queueNotTriggering
    delete this.queueTriggering
    delete this.issues
  })

  it('only should have functions "trigger()" and "emit()"', function () {
    expect(typeof this.queueNotTriggering.emitter.trigger).toBe('undefined')
    expect(typeof this.queueNotTriggering.emitter.emit).toBe('undefined')

    expect(typeof this.queueTriggering.emitter.trigger).toBe('function')
    expect(typeof this.queueTriggering.emitter.emit).toBe('function')
  })

  it('should emit custom messages', function (done) {
    this.queueTriggering.emitter.once('test', (message) => {
      expect(message).toBe('test')
      done()
    })
    this.queueTriggering.emitter.emit('test', 'test')
  })
})
