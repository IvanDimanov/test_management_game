/* global describe it expect beforeEach afterEach */
'use strict'

import Issue from './index.js'

describe('Issue initialization', function () {
  it('to be factory function', function () {
    expect(typeof Issue).toBe('function')
  })

  it('to throw on {Any} as invalid 1st argument "projectName"', function () {
    expect(() => Issue()).toThrowError(/1st argument/)
    expect(() => Issue('')).toThrowError(/1st argument/)
    expect(() => Issue(false)).toThrowError(/1st argument/)
    expect(() => Issue(null)).toThrowError(/1st argument/)
    expect(() => Issue({})).toThrowError(/1st argument/)
    expect(() => Issue([])).toThrowError(/1st argument/)
    expect(() => Issue(function () {})).toThrowError(/1st argument/)
    expect(() => Issue(new Date())).toThrowError(/1st argument/)
    expect(() => Issue(new RegExp())).toThrowError(/1st argument/)
  })

  it('to throw on {Any} as invalid 2nd argument "priority"', function () {
    expect(() => Issue('Test project')).toThrowError(/2nd argument/)
    expect(() => Issue('Test project', '')).toThrowError(/2nd argument/)
    expect(() => Issue('Test project', 'test')).toThrowError(/2nd argument/)
    expect(() => Issue('Test project', null)).toThrowError(/2nd argument/)
    expect(() => Issue('Test project', false)).toThrowError(/2nd argument/)
    expect(() => Issue('Test project', {})).toThrowError(/2nd argument/)
    expect(() => Issue('Test project', [])).toThrowError(/2nd argument/)
    expect(() => Issue('Test project', function () {})).toThrowError(/2nd argument/)
    expect(() => Issue('Test project', new Date())).toThrowError(/2nd argument/)
    expect(() => Issue('Test project', new RegExp())).toThrowError(/2nd argument/)
  })

  it('to throw on negative {Number} as invalid 2nd argument "priority"', function () {
    expect(() => Issue('Test project', -1)).toThrowError(/2nd argument/)
  })

  it('to throw on {Any} as invalid 3rd argument "complexity"', function () {
    expect(() => Issue('Test project', 1)).toThrowError(/3rd argument/)
    expect(() => Issue('Test project', 1, '')).toThrowError(/3rd argument/)
    expect(() => Issue('Test project', 1, 'test')).toThrowError(/3rd argument/)
    expect(() => Issue('Test project', 1, null)).toThrowError(/3rd argument/)
    expect(() => Issue('Test project', 1, false)).toThrowError(/3rd argument/)
    expect(() => Issue('Test project', 1, {})).toThrowError(/3rd argument/)
    expect(() => Issue('Test project', 1, [])).toThrowError(/3rd argument/)
    expect(() => Issue('Test project', 1, function () {})).toThrowError(/3rd argument/)
    expect(() => Issue('Test project', 1, new Date())).toThrowError(/3rd argument/)
    expect(() => Issue('Test project', 1, new RegExp())).toThrowError(/3rd argument/)
  })

  it('to throw on negative {Number} as invalid 3rd argument "complexity"', function () {
    expect(() => Issue('Test project', 1, -1)).toThrowError(/3rd argument/)
  })

  it('not to throw when correctly initialized', function () {
    expect(() => Issue('Test project', 1, 1)).not.toThrow()
    expect(() => Issue('Test project', 2, 2)).not.toThrow()
    expect(() => Issue('Test project', 3, 3)).not.toThrow()
  })
})

describe('Issue static status', function () {
  it('must have a static getter as "Issue.getAllowedStatuses()"', function () {
    expect(typeof Issue.getAllowedStatuses).toBe('function')
  })

  it('must be an array with values', function () {
    expect(Issue.getAllowedStatuses() instanceof Array).toBe(true)
    expect(Issue.getAllowedStatuses().length).toBeGreaterThan(0)
  })

  it('must be an array of non-empty {String}s', function () {
    Issue.getAllowedStatuses()
      .forEach((status) => expect(typeof status).toBe('string'))
    Issue.getAllowedStatuses()
      .forEach((status) => expect(status.length).toBeGreaterThan(0))
  })
})

describe('Issue', function () {
  beforeEach(function () {
    this.issue = Issue('Test project', 1, 1)
  })

  afterEach(function () {
    delete this.issue
  })

  it('should have a valid API function "getId()"', function () {
    expect(typeof this.issue.getId).toBe('function')
  })
  it('should have a valid API function "getProjectName()"', function () {
    expect(typeof this.issue.getProjectName).toBe('function')
  })
  it('should have a valid API function "getPriority()"', function () {
    expect(typeof this.issue.getPriority).toBe('function')
  })
  it('should have a valid API function "getComplexity()"', function () {
    expect(typeof this.issue.getComplexity).toBe('function')
  })
  it('should have a valid API function "getStatus()"', function () {
    expect(typeof this.issue.getStatus).toBe('function')
  })
  it('should have a valid API function "setStatus()"', function () {
    expect(typeof this.issue.setStatus).toBe('function')
  })
  it('should have a valid API function "getSpentWork()"', function () {
    expect(typeof this.issue.getSpentWork).toBe('function')
  })
  it('should have a valid API function "spentAdditionalWork()"', function () {
    expect(typeof this.issue.spentAdditionalWork).toBe('function')
  })
  it('should have a valid API function "getAllowedStatuses()"', function () {
    expect(typeof this.issue.getAllowedStatuses).toBe('function')
  })
  it('should have a valid API function "toString()"', function () {
    expect(typeof this.issue.toString).toBe('function')
  })

  it('should not throw after valid "getId()"', function () {
    expect(() => this.issue.getId()).not.toThrow()
  })
  it('should not throw after valid "getProjectName()"', function () {
    expect(() => this.issue.getProjectName()).not.toThrow()
  })
  it('should not throw after valid "getPriority()"', function () {
    expect(() => this.issue.getPriority()).not.toThrow()
  })
  it('should not throw after valid "getComplexity()"', function () {
    expect(() => this.issue.getComplexity()).not.toThrow()
  })
  it('should not throw after valid "getStatus()"', function () {
    expect(() => this.issue.getStatus()).not.toThrow()
  })
  it('should not throw after valid "setStatus()"', function () {
    expect(() => this.issue.setStatus('todo')).not.toThrow()
  })
  it('should not throw after valid "getSpentWork()"', function () {
    expect(() => this.issue.getSpentWork()).not.toThrow()
  })
  it('should not throw after valid "spentAdditionalWork()"', function () {
    expect(() => this.issue.spentAdditionalWork(1)).not.toThrow()
  })
  it('should not throw after valid "getAllowedStatuses()"', function () {
    expect(() => this.issue.getAllowedStatuses()).not.toThrow()
  })
  it('should not throw after valid "toString()"', function () {
    expect(() => this.issue.toString()).not.toThrow()
  })
})

describe('Issue', function () {
  const projectName = 'Test Project'

  beforeEach(function () {
    this.issues = Array.from({length: 3})
      .map((value, index) => Issue(projectName, index + 1, index + 1))
  })

  afterEach(function () {
    delete this.issues
  })

  it('should generate unique Ids', function () {
    expect(this.issues[0].getId()).not.toBe(this.issues[1].getId())
    expect(this.issues[0].getId()).not.toBe(this.issues[2].getId())
    expect(this.issues[1].getId()).not.toBe(this.issues[2].getId())
  })

  it('should return its Project Name after calling "projectName()"', function () {
    expect(this.issues[0].getProjectName()).toBe(projectName)
    expect(this.issues[1].getProjectName()).toBe(projectName)
    expect(this.issues[2].getProjectName()).toBe(projectName)
  })

  it('should return its Priority after calling "getPriority()"', function () {
    expect(this.issues[0].getPriority()).toBe(1)
    expect(this.issues[1].getPriority()).toBe(2)
    expect(this.issues[2].getPriority()).toBe(3)
  })

  it('should return its Complexity after calling "getComplexity()"', function () {
    expect(this.issues[0].getComplexity()).toBe(1)
    expect(this.issues[1].getComplexity()).toBe(2)
    expect(this.issues[2].getComplexity()).toBe(3)
  })

  it('should return its initial Status after calling "getStatus()"', function () {
    expect(this.issues[0].getStatus()).toBe('todo')
    expect(this.issues[1].getStatus()).toBe('todo')
    expect(this.issues[2].getStatus()).toBe('todo')
  })

  it('should update its Status after calling "setStatus()"', function () {
    expect(this.issues[0].getStatus()).toBe('todo')
    this.issues[0].setStatus('dev')
    expect(this.issues[0].getStatus()).toBe('dev')
  })

  it('should throw when calling "setStatus()" with unknown status', function () {
    expect(() => this.issues[0].setStatus('unknown')).toThrowError(/1st argument/)
  })

  it('should return its initial Spent Work after calling "getSpentWork()"', function () {
    expect(this.issues[0].getSpentWork()).toBe(0)
    expect(this.issues[1].getSpentWork()).toBe(0)
    expect(this.issues[2].getSpentWork()).toBe(0)
  })

  it('should update its Spent Work after calling "spentAdditionalWork()"', function () {
    expect(this.issues[0].getSpentWork()).toBe(0)
    this.issues[0].spentAdditionalWork(1)
    expect(this.issues[0].getSpentWork()).toBe(1)
  })

  it('should have instance access to static statuses', function () {
    const staticStatuses = Issue.getAllowedStatuses()
    expect(Issue.getAllowedStatuses() instanceof Array).toBe(true)
    expect(Issue.getAllowedStatuses().length).toBe(staticStatuses.length)

    Issue.getAllowedStatuses()
      .forEach((status, index) => expect(staticStatuses[index]).toBe(status))
  })

  it('should return non-empty {String} after calling "toString()"', function () {
    expect(typeof this.issues[0].toString()).toBe('string')
    expect(this.issues[0].toString().length).toBeGreaterThan(0)
  })
})
