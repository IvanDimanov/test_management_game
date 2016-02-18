/* global describe it expect beforeEach afterEach */
'use strict'

import TodoQueue from './index.js'
import Issue from '../issue'

describe('TodoQueue initialization', function () {
  it('to be factory function', function () {
    expect(typeof TodoQueue).toBe('function')
  })
})

describe('TodoQueue', function () {
  beforeEach(function () {
    this.todoQueue = TodoQueue(5)
  })

  afterEach(function () {
    delete this.todoQueue
  })

  it('should throw when pushing "done" issue', function () {
    const todoIssue = Issue('Test project', 1, 1)
    todoIssue.setStatus('done')
    expect(() => this.todoQueue.push(todoIssue)).toThrowError(/1st argument/)
  })

  it('should throw when pushing "dev" issue', function () {
    const todoIssue = Issue('Test project', 1, 1)
    todoIssue.setStatus('dev')
    expect(() => this.todoQueue.push(todoIssue)).toThrow()
  })

  it('should throw when pushing "todo" issue', function () {
    const todoIssue = Issue('Test project', 1, 1)
    todoIssue.setStatus('todo')
    expect(() => this.todoQueue.push(todoIssue)).not.toThrowError(/1st argument/)
  })
})
