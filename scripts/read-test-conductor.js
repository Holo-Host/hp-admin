const fs = require('fs')
const toml = require('toml')

const config = toml.parse(fs.readFileSync('./conductor-config-test.toml', 'utf-8'))

const agent1 = {
  id: config.agents[0].public_address || 'ERROR: No Agent Pub Key Found',
  nick: config.agents[0].id
}

const agent2 = {
  id: config.agents[1].public_address || 'ERROR: No Agent Pub Key Found',
  nick: config.agents[1].id
}

const httpInterface = config.interfaces.find(iface => iface.id === 'http-interface')

const httpPort = httpInterface.driver.port

const websocketInterface = config.interfaces.find(iface => iface.id === 'websocket-interface')

const websocketPort = websocketInterface.driver.port

module.exports = {
  agent1,
  agent2,
  httpPort,
  websocketPort
}
