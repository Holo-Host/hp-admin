const fs = require('fs')
const toml = require('toml')

const config1 = toml.parse(fs.readFileSync('./conductor-config.toml', 'utf-8'))
const config2 = toml.parse(fs.readFileSync('./conductor-config-extra.toml', 'utf-8'))
const Agent1 = {
  id: config1.agents[0].public_address || 'ERROR: No Agent Pub Key Found',
  nick: config1.agents[0].id
}
const Agent2 = {
  id: config2.agents[0].public_address || 'ERROR: No Agent Pub Key Found',
  nick: config2.agents[0].id
}

module.exports = {
  Agent1,
  Agent2
}
