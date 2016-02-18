/* global describe it expect beforeEach afterEach */
'use strict'

import GameClock from './index.js'

describe('GameClock initialization', function () {
  it('to be factory function', function () {
    expect(typeof GameClock).toBe('function')
  })

  it('to throw on {Any} as invalid 1st argument "tickingRate"', function () {
    expect(() => GameClock()).toThrowError(/1st argument/)
    expect(() => GameClock('')).toThrowError(/1st argument/)
    expect(() => GameClock('test')).toThrowError(/1st argument/)
    expect(() => GameClock(null)).toThrowError(/1st argument/)
    expect(() => GameClock({})).toThrowError(/1st argument/)
    expect(() => GameClock([])).toThrowError(/1st argument/)
    expect(() => GameClock(function () {})).toThrowError(/1st argument/)
    expect(() => GameClock(new Date())).toThrowError(/1st argument/)
    expect(() => GameClock(new RegExp())).toThrowError(/1st argument/)
  })

  it('to throw on {Number} as invalid 1st argument "tickingRate"', function () {
    expect(() => GameClock(0)).toThrowError(/1st argument/)
    expect(() => GameClock(-0)).toThrowError(/1st argument/)
    expect(() => GameClock(NaN)).toThrowError(/1st argument/)
    expect(() => GameClock(Infinity)).toThrowError(/1st argument/)
    expect(() => GameClock(0.01)).toThrowError(/1st argument/)
    expect(() => GameClock(-0.01)).toThrowError(/1st argument/)
    expect(() => GameClock(-1)).toThrowError(/1st argument/)
  })

  it('not to throw on {Integer} as valid 1st argument "tickingRate"', function () {
    expect(() => GameClock(1)).not.toThrow()
    expect(() => GameClock(10)).not.toThrow()
    expect(() => GameClock(100)).not.toThrow()
  })
})

describe('GameClock', function () {
  beforeEach(function () {
    this.gameClock = GameClock(1000)
  })

  afterEach(function () {
    this.gameClock.stop()
    delete this.gameClock
  })

  it('to have a "start()", "stop()" and "getSpentTime()" functions', function () {
    expect(typeof this.gameClock.start).toBe('function')
    expect(typeof this.gameClock.stop).toBe('function')
    expect(typeof this.gameClock.getSpentTime).toBe('function')
  })

  it('not ticking when not started', function (done) {
    expect(this.gameClock.getSpentTime()).toBeLessThan(10)
    setTimeout(() => {
      expect(this.gameClock.getSpentTime()).toBeGreaterThan(3000)
      expect(this.gameClock.getSpentTime()).toBeLessThan(3010)
      done()
    }, 3000)
  })

  it('ticking when started', function (done) {
    expect(this.gameClock.getSpentTime()).toBeLessThan(10)
    setTimeout(() => {
      expect(this.gameClock.getSpentTime()).toBeGreaterThan(3000)
      expect(this.gameClock.getSpentTime()).toBeLessThan(3010)
      done()
    }, 3000)
  })

  it('have valid emitter', function () {
    expect(typeof this.gameClock.emitter).toBe('object')
    expect(typeof this.gameClock.emitter.on).toBe('function')
    expect(typeof this.gameClock.emitter.once).toBe('function')
  })

  it('emit ticks', function (done) {
    let totalTicks = 0
    this.gameClock.start()
    this.gameClock.emitter.once('clock/tick', () => totalTicks++)
    this.gameClock.emitter.once('clock/tick', () => totalTicks++)
    this.gameClock.emitter.once('clock/tick', () => totalTicks++)
    setTimeout(() => {
      expect(totalTicks).toBe(3)
      done()
    }, 3000)
  })

  it('emit start events', function (done) {
    this.gameClock.emitter.once('clock/start', done)
    this.gameClock.start()
  })

  it('emit stop events', function (done) {
    this.gameClock.start()
    this.gameClock.emitter.once('clock/stop', done)
    this.gameClock.stop()
  })
})
