// Note, this is not really a config file. It's just a way for the JS to access the nix config
import fs from 'fs'
import toml from 'toml'

let config

// This is such a hack
if (process.env.NODE_ENV === 'test') {
  config = toml.parse(fs.readFileSync('./conductor-config.toml'))
} else {
  config = require('utils/integration-testing/conductor-config.toml')
}

export function getAgent (index = 0) {
  if (index && index >= config.agents.length) throw new Error(`There are less than ${index} agent(s) in the config`)
  return {
    id: config.agents[index].public_address,
    nickname: config.agents[index].name,
    conductorId: config.agents[index].id
  }
}

export function findInstanceForAgent (instanceId, agentIndex = 0) {
  const agent = getAgent(agentIndex)

  const instance = config.instances.find(instance => instance.dna === instanceId && instance.agent === agent.conductorId)
  if (!instance) throw new Error(`No instance found for id ${instanceId} and agent ${agent.conductorId}`)
  return instance
}
