'use strict'

/* UI styles not needed for tests */
if (process.env.NODE_ENV !== 'test') {
  require('./index.scss')
}

import EventEmitter from 'eventemitter3'
import {toString, getInstance, isInteger, roundAfterPoint} from '../shared/utils'

function GameMaster (todoQueue, workerEmitter) {
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

    if (!workerEmitter ||
        typeof workerEmitter !== 'object'
    ) {
      throw new TypeError(`2nd argument "workerEmitter" must be {JSON Object} but same is {${getInstance(workerEmitter)}} ${toString(workerEmitter)}`)
    }

    if (typeof workerEmitter.on !== 'function') {
      throw new TypeError(`2nd argument "workerEmitter" must have property "on" as {Function} but same is {${getInstance(workerEmitter.on)}} ${toString(workerEmitter.on)}`)
    }
  })()

  const that = {}
  const emitter = new EventEmitter()
  let disapproval = 0
  let isGameFinished = false

  /*
    Constant monitoring over the 'todoQueue' and
    how the "player" keep his issues assigned to the worker
  */
  ;(function updateDisapproval () {
    /* No need to continue if the Game is completed */
    if (isGameFinished) {
      return
    }

    const maxDisapproval = 8
    disapproval += roundAfterPoint(maxDisapproval * todoQueue.getSize() / todoQueue.getMaxSize(), 2)
    disapproval = Math.min(100, disapproval)

    /* Let all know about the new disapproval level */
    emitter.emit('disapproval/update', disapproval)

    /* Keep constant track of all that's happening at the Todo issues */
    setTimeout(updateDisapproval, 1000)
  })()

  /* As more and complex work is done, as more relaxed our Game Manager will be */
  workerEmitter.on('issue/pop', function reduceDisapproval (issue) {
    /* No need to continue if the Game is completed */
    if (isGameFinished) {
      return
    }

    disapproval = Math.max(0, disapproval - issue.getComplexity())
    disapproval = roundAfterPoint(disapproval, 2)
  })

  /* Stop doing everything */
  function stop () {
    isGameFinished = true
  }

  that.getDisapproval = () => disapproval
  that.stop = stop

  /* Let anyone listen for new events but only to some to emit any */
  that.emitter = {
    once: (...args) => emitter.once(...args),
    on: (...args) => emitter.on(...args),
    off: (...args) => emitter.off(...args),
    removeListener: (...args) => emitter.removeListener(...args)
  }

  return that
}

export default GameMaster
