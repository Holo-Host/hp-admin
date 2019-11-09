const fs = require('fs')
const toml = require('toml')

// HoloFuel Users :
const config = toml.parse(fs.readFileSync('./conductor-config.toml', 'utf-8'))
// NOTE: Following alt var for the config file is for testing out with manual conductor(ie: not nix auto-gen)
// const config = toml.parse(fs.readFileSync('./hpadmin-conductor-config.toml', 'utf-8'))
const Agent1 = {
  agentId: config.agents[0].public_address || 'ERROR: No Agent Pub Key Found',
  nick: config.agents[0].id
}
const Agent2 = {
  agentId: config.agents[1].public_address || 'ERROR: No Agent Pub Key Found',
  nick: config.agents[1].id
}
const AGENT_1_DNA_INSTANCE = config.instances.find(instance => instance.dna === 'holofuel' && instance.agent === config.agents[0].id).id
const AGENT_2_DNA_INSTANCE = config.instances.find(instance => instance.dna === 'holofuel' && instance.agent === config.agents[1].id).id

module.exports = {
  Agent1,
  Agent2,
  AGENT_1_DNA_INSTANCE,
  AGENT_2_DNA_INSTANCE
}
