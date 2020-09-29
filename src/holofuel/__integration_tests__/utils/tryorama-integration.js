const { Orchestrator, Config, combine, localOnly, callSync } = require('@holochain/tryorama')
export const dnaPath = '/nix/store/b98xs2vlmyscjpa2lsdqiw7l08yvhqsw-holofuel/holofuel.dna.json'

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
const dna = Config.dna(dnaPath, 'holofuel-dna', { uuid: '00000000-0000-0000-0000-000000000111', fixed_uuid: true })

export const conductorConfig = Config.gen({ [process.env.REACT_APP_TEST_DNA_INSTANCE_ID]: dna }, {
  logger: Config.logger(false),
  network: {
    type: 'sim2h',
    sim2h_url: 'ws://localhost:9000'
  }
})
