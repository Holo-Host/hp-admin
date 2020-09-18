const { Orchestrator, Config, combine, localOnly, callSync } = require('@holochain/tryorama')
export const dnaPath = '/nix/store/jinsv02qykq3l6kl7l8b857cs423658k-holofuel/holofuel.dna.json'

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
