export const dnaPath = process.env.REACT_APP_DNA_PATH
const { Orchestrator, Config, combine, localOnly, callSync } = require('@holochain/tryorama')

export const orchestrator = new Orchestrator({
  middleware: combine(
    localOnly,
    callSync
  ),
  waiter: {
    strict: false,
    hardTimeout: 1500
  }
})
const dna = Config.dna(dnaPath, 'holofuel-dna')

export const conductorConfig = Config.gen({[process.env.REACT_APP_TEST_DNA_INSTANCE_ID]: dna}, {
  logger: Config.logger(false),
  network: {
    type: 'sim2h',
    sim2h_url: 'ws://localhost:9000'
  }
})