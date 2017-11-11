import os from 'os'

export default function () {
  return {
    name: 'Server',
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3000,
    clustering: {
      activate: false,
      amountOfWorkers: os.cpus().length,
      workersRespawnDelay: 1000,
      workersLifeTime: 30000
    },
    internal: {
      debug: process.env.DEBUG || false
    }
  }
}
