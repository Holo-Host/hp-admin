import fs from 'fs'
import toml from 'toml'
import { connect } from '@holochain/hc-web-client'
import startTestConductor from '../scripts/startTestConductor.js'

// Conductor Agents/Instances :
const config = toml.parse(fs.readFileSync('./conductor-config.toml', 'utf-8'))
const Agent1 = {
  agentId: config.agents[0].public_address,
  nick: config.agents[0].id
}
const HAPP_STORE_DNA_INSTANCE = config.instances.find(instance => instance.dna === 'happ-store').id
const HHA_DNA_INSTANCE = config.instances.find(instance => instance.dna === 'holo-hosting-app').id

const instances = {
  has: HAPP_STORE_DNA_INSTANCE,
  hha: HHA_DNA_INSTANCE
}

const startScenario = (children, { options }) => {
  startTestConductor()
    .then(() => {
      console.log('Successful connection to Conductor!')
      connect({ url: 'ws://localhost:3400' })
        .then(async ({ callZome }) => {
          const scenarioTest = async (AgentNo, DnaInstances, zomeCallFn, { options }) => {
            return <>
              {children}
            </>
          }
          await scenarioTest(Agent1, instances, callZome, { options })
            .then(_ => process.exit())
        })
    })
}

export default startScenario
