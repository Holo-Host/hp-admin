const createZomeCall = require('./create-zome-call')
const { getAgent } = require('../src/utils/conductorConfig')

async function populateData () {
  const agent1 = getAgent()
  const agent2 = getAgent(1)

  const zomeCall = await createZomeCall('holofuel', 'transactions', 'whoami')
  const result = await zomeCall()
  console.log('result of zome call', result)

  // seed data:
  // a request from agent2 to agent1
  // an offer from agent2 to agent1
  // a request from agent1 to agent2 which agent 2 has paid
  // an offer from agent1 to agent2 which agent 2 has accepted
}

populateData()
