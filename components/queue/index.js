'use strict'

import EventEmitter from 'eventemitter3'
import {toString, getInstance, isInteger, clone} from '../shared/utils'
import Issue from '../issue'

const allowedIssueStatuses = Issue.getAllowedStatuses()

function Queue (allowedIssueStatus, maxSize, allowedToEmit = false) {
  ;(function inputValidation () {
    if (!~allowedIssueStatuses.indexOf(allowedIssueStatus)) {
      throw new TypeError(`1st argument "allowedIssueStatus" must be one of ["${allowedIssueStatuses.join('", "')}"] but same is {${getInstance(allowedIssueStatus)}} ${toString(allowedIssueStatus)}`)
    }

    if (!isInteger(maxSize) ||
        maxSize < 1 ||
        maxSize > 20
    ) {
      throw new TypeError(`2nd argument "maxSize" must be {Integer} between [1, 20] (both included) but same is {${getInstance(maxSize)}} ${toString(maxSize)}`)
    }

    if (typeof allowedToEmit !== 'boolean') {
      throw new TypeError(`3rd argument "allowedToEmit" (optional, defaults to "false") must be {Boolean} but same is {${getInstance(allowedToEmit)}} ${toString(allowedToEmit)}`)
    }
  })()

  const that = {}
  const map = new Map()
  const queueEmitter = new EventEmitter()

  /* Fill the queue w/ new elements/issues */
  function push (issue) {
    if (map.size >= maxSize) {
      throw new RangeError(`Unable to add new issue since queue max size of ${maxSize} already reached`)
    }

    let id
    ;(function inputValidation () {
      if (!issue ||
          typeof issue !== 'object'
      ) {
        throw new TypeError(`1st argument "issue" must be {Object} but same is {${getInstance(issue)}} ${toString(issue)}`)
      }

      if (typeof issue.getId !== 'function') {
        throw new TypeError(`1st argument "issue" must have property "getId" {Function} but same is {${getInstance(issue.getId)}} ${toString(issue.getId)}`)
      }

      id = issue.getId()
      if (!id &&
          typeof id !== 'number'
      ) {
        throw new TypeError(`1st argument "issue.getId()" must return a value but same is {${getInstance(id)}} ${toString(id)}`)
      }

      if (typeof issue.getStatus !== 'function') {
        throw new TypeError(`1st argument "issue" must have property "getStatus" {Function} but same is {${getInstance(issue.getStatus)}} ${toString(issue.getStatus)}`)
      }

      const status = issue.getStatus()
      if (status !== allowedIssueStatus) {
        throw new TypeError(`1st argument "issue.getStatus()" must return status equal to "${allowedIssueStatus}" but same is {${getInstance(status)}} ${toString(status)}`)
      }
    })()

    map.set(id, issue)

    /* Let all subscribers know abut the new value but no one to be able to alter it */
    queueEmitter.emit('issue/push', clone(issue))
  }

  /* Remove a specific element from the queue by its identification (issue Id) */
  function popById (id) {
    if (!map.has(id)) {
      throw new ReferenceError(`Unable to pop issue since issue with id ${toString(id)} do not exist`)
    }

    const issue = map.get(id)
    map.delete(id)

    /* Announce the removal event to all subscribers but let the callee bee the 1st to know */
    setTimeout(function emitUpdate () {
      queueEmitter.emit('issue/pop', clone(issue))
    }, 0)

    return issue
  }

  that.push = push
  that.popById = popById
  that.getSize = () => map.size
  that.getMaxSize = () => maxSize

  /* Be sure no one can alter an issue while iterating over them */
  that.getIssues = () => clone(Array.from(map.values()).map((issue) => issue))

  /* Let anyone listen for new events but only to some to emit any */
  that.emitter = {
    once: (...args) => queueEmitter.once(...args),
    on: (...args) => queueEmitter.on(...args),
    off: (...args) => queueEmitter.off(...args),
    removeListener: (...args) => queueEmitter.removeListener(...args)
  }

  if (allowedToEmit) {
    that.emitter.emit = (...args) => queueEmitter.emit(...args)
    that.emitter.trigger = (...args) => queueEmitter.trigger(...args)
  }

  return that
}

export default Queue
