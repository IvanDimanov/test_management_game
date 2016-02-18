/* global describe it expect beforeEach afterEach */
'use strict'

import DevQueue from './index.js'
import Issue from '../issue'

describe('DevQueue initialization', function () {
  it('to be factory function', function () {
    expect(typeof DevQueue).toBe('function')
  })
})

describe('DevQueue', function () {
  beforeEach(function () {
    this.devQueue = DevQueue(5)
  })

  afterEach(function () {
    delete this.devQueue
  })

  it('should throw when pushing "todo" issue', function () {
    const todoIssue = Issue('Test project', 1, 1)
    todoIssue.setStatus('todo')
    expect(() => this.devQueue.push(todoIssue)).toThrowError(/1st argument/)
  })

  it('should throw when pushing "done" issue', function () {
    const todoIssue = Issue('Test project', 1, 1)
    todoIssue.setStatus('done')
    expect(() => this.devQueue.push(todoIssue)).toThrowError(/1st argument/)
  })

  it('should not throw when pushing "dev" issue', function () {
    const todoIssue = Issue('Test project', 1, 1)
    todoIssue.setStatus('dev')
    expect(() => this.devQueue.push(todoIssue)).not.toThrow()
  })
})
