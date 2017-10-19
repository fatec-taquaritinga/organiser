import os from 'os'

const clustering = {
  activate: false,
  amountOfWorkers: os.cpus().length,
  workersRespawnDelay: 1000,
  workersLifeTime: 30000
}

export default {
  name: 'Server',
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 3000,
  clustering,
  internal: {
    debug: process.env.DEBUG || false
  }
}
