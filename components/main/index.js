/* global alert */
'use strict'

console.clear()
require('./index.scss')

import {log, roundAfterPoint, formatDate} from '../shared/utils'
import IssueGenerator from '../issue-generator'
import TodoQueue from '../todo-queue'
import Worker from '../worker'
import GameMaster from '../game-master'
import GameClock from '../game-clock'

const worker = Worker(5, 4)
const todoQueue = TodoQueue(10)
const gameMaster = GameMaster(todoQueue, worker.emitter)
const gameClock = GameClock(1000)

/* Takes care of how issues are drawn, moved and erased from the Todo Queue */
;(function manageTodoIssuesUi () {
  /* Create UI DOM for each incoming issue */
  todoQueue.emitter.on('issue/push', function addIssueToUi (issue) {
    const element = document.createElement('div')
    element.id = `todo-issue-${issue.getId()}`
    element.setAttribute('class', `issue issue-complexity-${issue.getComplexity()}`)
    element.innerHTML = issue.toString()

    /*
      Update the issue state from 'todo' -> 'dev' and
      update the respected queues
    */
    element.onclick = function sendToworker () {
      /* Do not send more issues than the worker can take */
      if (worker.queue.getSize() >= worker.queue.getMaxSize()) {
        return
      }

      const devIssue = todoQueue.popById(issue.getId())
      devIssue.setStatus('dev')
      worker.queue.push(devIssue)
    }

    document.getElementById('todoQueue').appendChild(element)
  })

  /* Remove all trails of issue existence in the Todo Queue */
  todoQueue.emitter.on('issue/pop', function removeFromUi (issue) {
    document.getElementById('todoQueue').removeChild(
      document.getElementById(`todo-issue-${issue.getId()}`)
    )
  })
})()

/* Takes care of how issues are drawn, updated and erased from the Dev Queue */
;(function manageDevIssuesUi () {
  /* TODO: Template engine will fit nicely */
  function getIssueHtml (issue) {
    return `${issue.toString()} - <em>${roundAfterPoint(issue.getSpentWork() / issue.getComplexity() * 100, 2)}%</em>`
  }

  /* Create UI DOM for each incoming issue */
  worker.emitter.on('issue/push', function addIssueToUi (issue) {
    const element = document.createElement('div')
    element.id = `dev-issue-${issue.getId()}`
    element.setAttribute('class', `issue issue-complexity-${issue.getComplexity()}`)
    element.innerHTML = getIssueHtml(issue)

    document.getElementById('devQueue').appendChild(element)
  })

  /* Update the issue progress on every work term */
  worker.emitter.on('issue/work', function updateIssueUi (issue) {
    const element = document.getElementById(`dev-issue-${issue.getId()}`)
    element.innerHTML = getIssueHtml(issue)
  })

  /* Remove all trails of issue existence in the Dev Queue */
  worker.emitter.on('issue/pop', function removeFromUi (issue) {
    document.getElementById('devQueue').removeChild(
      document.getElementById(`dev-issue-${issue.getId()}`)
    )
  })
})()

/* Keep the manager posted about how much work the worker is capable to do at the moment */
;(function presentWorkerStressUi () {
  function getStressHtml (stress) {
    return `Worker stress - <em>${stress}%</em>`
  }

  /* Initially we're all calm and happy to start working */
  document.getElementById('workerStress').innerHTML = getStressHtml(0)

  /* With time passing our anxiety for new issues varies */
  worker.emitter.on('worker/stress', (stress) => { document.getElementById('workerStress').innerHTML = getStressHtml(stress) })
})()

/* Present in the UI bar just how much the Game Maker is stressed about the "player" issue management */
gameMaster.emitter.on('disapproval/update', function updateDisapprovalUi (disapproval) {
  document.querySelector('#gameManagerDisapproval .bar').setAttribute('style', `width: ${disapproval}%`)
})

/* Have a measurement of player success */
gameClock.start()
gameClock.emitter.on('clock/tick', (spentTime) => { document.getElementById('gameClock').innerHTML = formatDate('mm:ss', spentTime) })

/* Check when we need to stop tracking game time and present the result */
gameMaster.emitter.on('disapproval/update', function shouldStopTheGame (disapproval) {
  if (disapproval < 100) {
    return
  }

  /* Cover the scene so the Player won't be able to continue */
  document.getElementById('cloak').setAttribute('style', 'display: block')

  /* Stop all started actions in order to prevent moving parts after Game completion */
  gameMaster.stop()
  gameClock.stop()
  worker.stop()
  issueGenerator.stop()

  /* Announce the Player success */
  alert(`You've completed the game in ${formatDate('mm:ss', gameClock.getSpentTime())}`)
  /* TODO: Some proper fireworks, scoreboards, sending result to the Backend, etc. */
})

/* Kickoff the process by starting to generate pseudo-random issues of various projects */
/* TODO: Project names and the "rage of generating issues" should come from a config */
const issueGenerator = IssueGenerator(todoQueue, ['Lenono', 'Apple', 'Qmartic'], 0.05)

log('issueGenerator =', issueGenerator.toString())
log(' * Process up and running * ')
