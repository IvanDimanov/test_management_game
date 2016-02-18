'use strict'

/* UI styles not needed for tests */
if (process.env.NODE_ENV !== 'test') {
  require('./index.scss')
}

import Queue from '../queue'
import Issue from '../issue'

function DevQueue (maxSize, allowedToEmit) {
  /* TODO: This indexation could be part of a config at the beginning of the app */
  return Queue(Issue.getAllowedStatuses()[1], maxSize, allowedToEmit)
}

export default DevQueue
