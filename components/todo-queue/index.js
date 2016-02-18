'use strict'

/* UI styles not needed for tests */
if (process.env.NODE_ENV !== 'test') {
  require('./index.scss')
}

import Queue from '../queue'
import Issue from '../issue'

function TodoQueue (maxSize) {
  /* TODO: This indexation could be part of a config at the beginning of the app */
  return Queue(Issue.getAllowedStatuses()[0], maxSize)
}

export default TodoQueue
