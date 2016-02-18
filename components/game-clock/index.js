'use strict'

/* UI styles not needed for tests */
if (process.env.NODE_ENV !== 'test') {
  require('./index.scss')
}

import EventEmitter from 'eventemitter3'
import {toString, getInstance, isInteger} from '../shared/utils'

function GameClock (tickingRate) {
  if (!isInteger(tickingRate) ||
      tickingRate < 1
  ) {
    throw new TypeError(`1st argument "tickingRate" must be positive {Integer} but same is {${getInstance(tickingRate)}} ${toString(tickingRate)}`)
  }

  const that = {}
  const emitter = new EventEmitter()

  let startTime = Date.now()
  let ticking = false

  function start () {
    startTime = Date.now()
    ticking = true
    emitter.emit('clock/start', startTime)
    tick()
  }

  function stop () {
    ticking = false
    emitter.emit('clock/stop')
  }

  function getSpentTime () {
    return Date.now() - startTime
  }

  function tick () {
    if (!ticking) {
      return
    }

    emitter.emit('clock/tick', Date.now() - startTime)
    setTimeout(tick, tickingRate)
  }

  that.start = start
  that.stop = stop
  that.getSpentTime = getSpentTime
  that.emitter = emitter

  return that
}

export default GameClock
