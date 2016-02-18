'use strict'

import {toString, getInstance, isInteger, isFloat, getRandomNumber} from '../shared/utils'
import Issue from '../issue'

const initialIssueStatus = Issue.getAllowedStatuses()[0]

function IssueGenerator (todoQueue, projectNames, issueGeneratonRate) {
  ;(function inputValidation () {
    if (!todoQueue ||
        typeof todoQueue !== 'object'
    ) {
      throw new TypeError(`1st argument "todoQueue" must be {JSON Object} but same is {${getInstance(todoQueue)}} ${toString(todoQueue)}`)
    }

    if (typeof todoQueue.getSize !== 'function') {
      throw new TypeError(`1st argument "todoQueue" must have property "getSize" as {Function} but same is {${getInstance(todoQueue.getSize)}} ${toString(todoQueue.getSize)}`)
    }

    const size = todoQueue.getSize()
    if (!isInteger(size) ||
        size < 0
    ) {
      throw new TypeError(`1st argument "todoQueue.getSize()" must return non-negative {Integer} but same is {${getInstance(size)}} ${toString(size)}`)
    }

    if (typeof todoQueue.getMaxSize !== 'function') {
      throw new TypeError(`1st argument "todoQueue" must have property "getMaxSize" as {Function} but same is {${getInstance(todoQueue.getMaxSize)}} ${toString(todoQueue.getMaxSize)}`)
    }

    const maxSize = todoQueue.getMaxSize()
    if (!isInteger(maxSize) ||
        maxSize < 0
    ) {
      throw new TypeError(`1st argument "todoQueue.getMaxSize()" must return non-negative {Integer} but same is {${getInstance(maxSize)}} ${toString(maxSize)}`)
    }

    if (!(projectNames instanceof Array)) {
      throw new TypeError(`2nd argument "projectNames" must be {Array} but same is {${getInstance(projectNames)}} ${toString(projectNames)}`)
    }

    if (!projectNames.length) {
      throw new TypeError('2nd argument "projectNames" must not be empty {Array}')
    }

    projectNames.forEach(function validateProjectName (projectName, index) {
      if (!projectName ||
          typeof projectName !== 'string'
      ) {
        throw new TypeError(`2nd argument "projectNames" must be {Array} of {String}s but element at #${index} is {${getInstance(projectName)}} ${toString(projectName)}`)
      }
    })

    if (!isFloat(issueGeneratonRate) ||
        issueGeneratonRate <= 0 ||
        issueGeneratonRate >= 1
    ) {
      throw new TypeError(`3rd argument "issueGeneratonRate" must be {Float} between (0, 1) (both excluded) but same is {${getInstance(issueGeneratonRate)}} ${toString(issueGeneratonRate)}`)
    }
  })()

  const that = {}
  let isGameFinished = false

  ;(function pushNewIssue () {
    /* No need to continue if the Game is completed */
    if (isGameFinished) {
      return
    }

    /*
      Calculate how many new issues we need to push into the queue in respect the 'issueGeneratonRate'.
      Example: If the 'todoQueue' have a cap size of 20 and 'issueGeneratonRate' is 0.5 then
      we need to push 10 new issues every second.
      NOTE: Calculate the value every time so it can respond to a change in both queue size and generation rate.
    */
    const timeout = 1000 / (todoQueue.getMaxSize() * issueGeneratonRate)

    /* Event if 'todoQueue' to have its checks we do not need to be too "pushy" about it */
    if (todoQueue.getSize() >= todoQueue.getMaxSize()) {
      setTimeout(pushNewIssue, timeout)
      return
    }

    const randProjectName = projectNames[getRandomNumber(0, projectNames.length - 1)]
    const randPriority = getRandomNumber(1, 3)
    const randComplexity = getRandomNumber(1, 10)

    try {
      const newIssue = Issue(randProjectName, randPriority, randComplexity)

      /* Be sure that all issues in this queue are in their initial state */
      if (newIssue.getStatus() !== initialIssueStatus) {
        newIssue.setStatus(initialIssueStatus)
      }

      todoQueue.push(newIssue)
    } catch (error) {
      /* TODO: Proper error logging - probably Backend integration or https://raygun.io */
      console.error(error)
    }

    /*
      Keep on the process repeat itself only when we are sure we want it to.
      That's why we use 'setTimeout()' instead of 'setInterval()'.
    */
    setTimeout(pushNewIssue, timeout)
  })()

  /* Stop doing everything */
  function stop () {
    isGameFinished = true
  }

  that.stop = stop
  that.toString = () => `Projects "${projectNames.join('", "')}"; Generation rate ${issueGeneratonRate}`

  return that
}

export default IssueGenerator
