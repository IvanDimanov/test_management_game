/* global describe it expect beforeEach afterEach */
'use strict'

import IssueGenerator from './index.js'
import TodoQueue from '../todo-queue'

describe('IssueGenerator initialization', function () {
  beforeEach(function () {
    this.todoQueue = TodoQueue(5)
  })

  afterEach(function () {
    delete this.todoQueue
  })

  it('to be factory function', function () {
    expect(typeof IssueGenerator).toBe('function')
  })

  it('to throw on {Any} as invalid 1st argument "todoQueue"', function () {
    expect(() => IssueGenerator()).toThrowError(/1st argument/)
    expect(() => IssueGenerator('')).toThrowError(/1st argument/)
    expect(() => IssueGenerator(11)).toThrowError(/1st argument/)
    expect(() => IssueGenerator(false)).toThrowError(/1st argument/)
    expect(() => IssueGenerator(null)).toThrowError(/1st argument/)
    expect(() => IssueGenerator({})).toThrowError(/1st argument/)
    expect(() => IssueGenerator([])).toThrowError(/1st argument/)
    expect(() => IssueGenerator(function () {})).toThrowError(/1st argument/)
    expect(() => IssueGenerator(new Date())).toThrowError(/1st argument/)
    expect(() => IssueGenerator(new RegExp())).toThrowError(/1st argument/)
  })

  it('to throw on {Any} as invalid 2nd argument "projectNames"', function () {
    expect(() => IssueGenerator(this.todoQueue)).toThrowError(/2nd argument/)
    expect(() => IssueGenerator(this.todoQueue, '')).toThrowError(/2nd argument/)
    expect(() => IssueGenerator(this.todoQueue, 11)).toThrowError(/2nd argument/)
    expect(() => IssueGenerator(this.todoQueue, null)).toThrowError(/2nd argument/)
    expect(() => IssueGenerator(this.todoQueue, false)).toThrowError(/2nd argument/)
    expect(() => IssueGenerator(this.todoQueue, {})).toThrowError(/2nd argument/)
    expect(() => IssueGenerator(this.todoQueue, [])).toThrowError(/2nd argument/)
    expect(() => IssueGenerator(this.todoQueue, function () {})).toThrowError(/2nd argument/)
    expect(() => IssueGenerator(this.todoQueue, new Date())).toThrowError(/2nd argument/)
    expect(() => IssueGenerator(this.todoQueue, new RegExp())).toThrowError(/2nd argument/)
  })

  it('to throw on {Array} of non {String}s as invalid 2nd argument "projectNames"', function () {
    expect(() => IssueGenerator(this.todoQueue, [''])).toThrowError(/2nd argument/)
    expect(() => IssueGenerator(this.todoQueue, ['Project Name', 11])).toThrowError(/2nd argument/)
  })

  it('to throw on {Any} as invalid 3rd argument "issueGeneratonRate"', function () {
    expect(() => IssueGenerator(this.todoQueue, ['Project Name'])).toThrowError(/3rd argument/)
    expect(() => IssueGenerator(this.todoQueue, ['Project Name'], '')).toThrowError(/3rd argument/)
    expect(() => IssueGenerator(this.todoQueue, ['Project Name'], 11)).toThrowError(/3rd argument/)
    expect(() => IssueGenerator(this.todoQueue, ['Project Name'], null)).toThrowError(/3rd argument/)
    expect(() => IssueGenerator(this.todoQueue, ['Project Name'], false)).toThrowError(/3rd argument/)
    expect(() => IssueGenerator(this.todoQueue, ['Project Name'], {})).toThrowError(/3rd argument/)
    expect(() => IssueGenerator(this.todoQueue, ['Project Name'], [])).toThrowError(/3rd argument/)
    expect(() => IssueGenerator(this.todoQueue, ['Project Name'], function () {})).toThrowError(/3rd argument/)
    expect(() => IssueGenerator(this.todoQueue, ['Project Name'], new Date())).toThrowError(/3rd argument/)
    expect(() => IssueGenerator(this.todoQueue, ['Project Name'], new RegExp())).toThrowError(/3rd argument/)
  })

  it('not to throw when correctly initialized', function () {
    expect(() => IssueGenerator(this.todoQueue, ['Project 1'], 0.01)).not.toThrow()
    expect(() => IssueGenerator(this.todoQueue, ['Project 1', 'Project 2'], 0.5)).not.toThrow()
  })
})

describe('IssueGenerator API', function () {
  beforeEach(function () {
    this.todoQueue = TodoQueue(5)
    this.issueGenerator = IssueGenerator(this.todoQueue, ['Project 1'], 0.01)
  })

  afterEach(function () {
    this.issueGenerator.stop()
    delete this.issueGenerator
    delete this.todoQueue
  })

  it('should have a {Function} "stop()"', function () {
    expect(typeof this.issueGenerator.stop).toBe('function')
  })
  it('should have a valid API function "toString()"', function () {
    expect(typeof this.issueGenerator.toString).toBe('function')
  })

  it('should not throw after valid "stop()"', function () {
    expect(() => this.issueGenerator.stop()).not.toThrow()
  })
  it('should not throw after valid "toString()"', function () {
    expect(() => this.issueGenerator.toString()).not.toThrow()
  })

  it('should return non-empty {String} after calling "toString()"', function () {
    expect(typeof this.issueGenerator.toString()).toBe('string')
    expect(this.issueGenerator.toString().length).toBeGreaterThan(0)
  })
})

describe('IssueGenerator', function () {
  it('should add issues in a time manner', function (done) {
    const todoQueue = TodoQueue(5)
    const issueGenerator = IssueGenerator(todoQueue, ['Project 1'], 0.5)
    const initialSize = todoQueue.getSize()

    setTimeout(() => {
      issueGenerator.stop()
      const size = todoQueue.getSize()
      expect(size).toBeGreaterThan(initialSize)
      done()
    }, 2000)
  })

  it('adding issues rate should increase when increasing 3rd argument "issueGeneratonRate"', function (done) {
    const fastTodoQueue = TodoQueue(5)
    const fastIssueGenerator = IssueGenerator(fastTodoQueue, ['Project 1'], 0.99)

    const slowTodoQueue = TodoQueue(5)
    const slowIssueGenerator = IssueGenerator(slowTodoQueue, ['Project 1'], 0.01)

    setTimeout(() => {
      fastIssueGenerator.stop()
      slowIssueGenerator.stop()

      const fastSize = fastTodoQueue.getSize()
      const slowSize = slowTodoQueue.getSize()
      expect(fastSize).toBeGreaterThan(slowSize)

      done()
    }, 2000)
  })

  it('should not add issues after calling "stop()"', function (done) {
    const todoQueue = TodoQueue(5)
    const issueGenerator = IssueGenerator(todoQueue, ['Project 1'], 0.5)
    issueGenerator.stop()
    const initialSize = todoQueue.getSize()

    setTimeout(() => {
      const size = todoQueue.getSize()
      expect(size).toBe(initialSize)
      done()
    }, 2000)
  })
})
