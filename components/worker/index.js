'use strict'

/* UI styles not needed for tests */
if (process.env.NODE_ENV !== 'test') {
  require('./index.scss')
}

import {toString, getInstance, isInteger, roundAfterPoint} from '../shared/utils'
import DevQueue from '../dev-queue'

let totallyCreated = 0

function Worker (maxActiveIssues, workPoints) {
  ;(function inputValidation () {
    if (!isInteger(maxActiveIssues) ||
        maxActiveIssues < 1
    ) {
      throw new TypeError(`1st argument "maxActiveIssues" must be positive {Integer} but same is {${getInstance(maxActiveIssues)}} ${toString(maxActiveIssues)}`)
    }

    if (typeof workPoints !== 'number' ||
        workPoints <= 0
    ) {
      throw new TypeError(`2nd argument "workPoints" must be positive {Number} but same is {${getInstance(workPoints)}} ${toString(workPoints)}`)
    }
  })()

  const that = {}
  const id = totallyCreated++
  const devQueue = DevQueue(maxActiveIssues, true)
  let isGameFinished = false

  ;(function work () {
    /* No need to continue if the Game is completed */
    if (isGameFinished) {
      return
    }

    /*
      If there are no issues to resolve now,
      we'll wait till someone add new ones
    */
    if (!devQueue.getSize()) {
      /* Be sure to start working on an issue after all subscribers have heart its been pushed */
      devQueue.emitter.once('issue/push', () => setTimeout(work))
      return
    }

    const issues = devQueue.getIssues()

    /* Create a mapping where we'll know exactly how many issues there are for every known Project name */
    /* Example: {"Apple": 3, "Lenovo": 2, "Qmartic": 3} */
    /* Example: {"Apple": 3} */
    const issuesPerProjectName = issues.reduce((map, issue) => {
      const projectName = issue.getProjectName()
      if (!map[projectName]) {
        map[projectName] = 0
      }
      map[projectName]++
      return map
    }, {})

    /*
      Working every term with the same enthusiastic approach ("work points") is not realistic :)
      We'll reduce the ability of work concentration by taking into a concert
      the total number of projects a worker must switch between and
      the total number of issues that awaits him.
    */
    let termWorkPoints = workPoints

    /* No need for penalty if there's just a single issue to work on */
    const totalIssues = issues.length
    if (totalIssues > 1) {
      /* TODO: This factor should come from a config module */
      const maxIssuesPenalty = 0.5
      const penalty = 1 - maxIssuesPenalty * totalIssues / maxActiveIssues
      termWorkPoints *= penalty
    }

    /* No need for penalty if there's just a single Project to work on */
    const totalProjectGroups = Object.keys(issuesPerProjectName).length
    if (totalProjectGroups > 1) {
      /*
        Switching between project is worse than
        switching between issues in the same project,
        hence the higher penalty factor
      */
      /* TODO: This factor should come from a config module */
      const maxIssuesPenalty = 0.8
      const penalty = 1 - maxIssuesPenalty * totalProjectGroups / maxActiveIssues
      termWorkPoints *= penalty
    }

    /*
      Let the issue assignee knows how much the worker is stressed so
      he'll know how much more new issues he can assign to him
    */
    devQueue.emitter.emit('worker/stress', 100 - roundAfterPoint(termWorkPoints / workPoints * 100, 2))

    /*
      Convert the Project name related mapping into groups of issues.
      That's how we'll have the group of most issues to be "worked" 1st.
    */
    Object.keys(issuesPerProjectName)
      .map((projectName) => issues
        /* Create separate arrays of issues for each Project name group of issues */
        .filter((issue) => issue.getProjectName() === projectName)

        /* Sort the issues in the group so we can start working from the issues with highest priority */
        .sort((issue1, issue2) => issue1.getPriority() - issue2.getPriority())
      )

      /* Combine all groups of issues so once we're finished with one group we can immediately start working on another */
      .reduce((issues1, issues2) => issues1.concat(issues2))

      /*
        Work on each issue in a sequence
        with the respected groups order
        with the respected issue priority
      */
      .forEach((issue) => {
        /* Cannot work on issue if we already spent our "work" points */
        if (!termWorkPoints) {
          return
        }

        /* Get how much points do we need to spent on this issue and how much did we already spent */
        const complexity = issue.getComplexity()
        const spentWork = issue.getSpentWork()

        const workPointsTillCompletion = roundAfterPoint(Math.max(0, complexity - spentWork), 2)

        if (workPointsTillCompletion > termWorkPoints) {
          /* We cannot complete the issue in this term */
          issue.spentAdditionalWork(termWorkPoints)
          devQueue.emitter.emit('issue/work', issue)
          termWorkPoints = 0
          return
        }

        /* Sent the needed "work" points to finally complete the issue */
        issue.spentAdditionalWork(workPointsTillCompletion)
        devQueue.emitter.emit('issue/work', issue)
        termWorkPoints = Math.max(0, termWorkPoints - workPointsTillCompletion)
        termWorkPoints = roundAfterPoint(termWorkPoints, 2)

        /* Complete the issue */
        const doneIssue = devQueue.popById(issue.getId())
        doneIssue.setStatus('done')
      })

    /*
      Start a new term only when the current one is completed.
      Not using 'setInterval()' in order to prevent overlapping terms and
      been able to use a better pub/sub policy once all issues are completed.
    */
    setTimeout(work, 1000)
  })()

  /* Stop doing everything */
  function stop () {
    isGameFinished = true
  }

  that.getId = () => id
  that.stop = stop

  /* Let callee assign issues to the worker */
  that.queue = devQueue

  /* Let all know what the worker is been doing */
  that.emitter = devQueue.emitter
  that.toString = () => `Worker #${id}; maximum issues in the queue ${maxActiveIssues}; maximum working points ${workPoints}`

  return that
}

export default Worker
