'use strict'

/* UI styles not needed for tests */
if (process.env.NODE_ENV !== 'test') {
  require('./index.scss')
}

import {toString, getInstance, isInteger, clone, roundAfterPoint} from '../shared/utils'

const allowedStatuses = ['todo', 'dev', 'done']
let totallyCreated = 0

function Issue (projectName, priority, complexity) {
  ;(function inputValidation () {
    if (!projectName ||
        typeof projectName !== 'string'
    ) {
      throw new TypeError(`1st argument "projectName" must be non-empty {String} but same is {${getInstance(projectName)}} ${toString(projectName)}`)
    }

    if (!isInteger(priority) ||
        priority < 1 ||
        priority > 3
    ) {
      throw new TypeError(`2nd argument "priority" must be {Integer} between [1, 3] (both included) but same is {${getInstance(priority)}} ${toString(priority)}`)
    }

    if (!isInteger(complexity) ||
        complexity < 1 ||
        complexity > 10
    ) {
      throw new TypeError(`3rd argument "complexity" must be {Integer} between [1, 10] (both included) but same is {${getInstance(complexity)}} ${toString(complexity)}`)
    }
  })()

  const that = {}
  let status = allowedStatuses[0]
  let spentWork = 0

  /* Unique identification between all issues */
  const id = totallyCreated++

  /* Secure updating the internal 'status' with a list of discrete properties */
  function setStatus (newStatus) {
    if (!~allowedStatuses.indexOf(newStatus)) {
      throw new TypeError(`1st argument "newStatus" must be one of ["${allowedStatuses.join('", "')}"] but same is {${getInstance(newStatus)}} ${toString(newStatus)}`)
    }

    status = newStatus
  }

  function getSpentWork () {
    return spentWork
  }

  function spentAdditionalWork (work) {
    if (typeof work !== 'number' ||
        work <= 0
    ) {
      throw new TypeError(`1st argument "work" must be one positive {Number} but same is {${getInstance(work)}} ${toString(work)}`)
    }

    spentWork = roundAfterPoint(spentWork + work, 2)
  }

  that.getId = () => id
  that.getProjectName = () => projectName
  that.getPriority = () => priority
  that.getComplexity = () => complexity
  that.getStatus = () => status
  that.setStatus = setStatus
  that.getSpentWork = getSpentWork
  that.spentAdditionalWork = spentAdditionalWork
  that.getAllowedStatuses = Issue.getAllowedStatuses
  that.toString = () => `#${id}; Project "${projectName}"; Priority ${priority}; Complexity ${complexity}; Spent work ${spentWork}`

  return that
}

/* Let all users know that kind of statuses they can assign to an Issue */
Issue.getAllowedStatuses = () => clone(allowedStatuses)

export default Issue
