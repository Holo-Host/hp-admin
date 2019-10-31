const createZomeCall = require('./create-zome-call')
const { getAgent } = require('../src/utils/conductorConfig')
const moment = require('moment')

const randomNumber = (number = 10000) => {
  return Math.round(Math.random() * number)
}

const txParams = {
  amount: randomNumber,
  notes: 'Pre-Seed Data',
  deadline: moment().subtract(10, 'days').toISOString()
}

async function populateData () {
  const agent1 = getAgent()
  const agent2 = getAgent(1)
  const whoami = (agent) => createZomeCall('holofuel', 'transactions', 'whoami')(agent = 0)

  // Seed Data:
  // Scenario: A request from agent2 to agent1
  console.log('>> Whoami: ', whoami(1))
  const initiateRequest = await createZomeCall('holofuel', 'transactions', 'request', agent2)({ ...txParams, from: agent1 })
  console.log('>> Initiate Request Success Hash', initiateRequest)

  // Scenario: An offer from agent2 to agent1
  console.log('>> Whoami: ', whoami(1))
  const initiateOffer = await createZomeCall('holofuel', 'transactions', 'promise', agent2)({ ...txParams, to: agent1 })
  console.log('>> Initiate Request Success Hash', initiateOffer)

  // Scenario: A request from agent1 to agent2 which agent 2 has paid :
  // 1. Agent 1 request HF from Agent 2
  console.log('>> Whoami: ', whoami(0))
  await createZomeCall('holofuel', 'transactions', 'request', agent1)({ ...txParams, from: agent2 })
    .then(async (r) => {
      const { Ok: originId } = JSON.parse(r)
      const transaction = await createZomeCall('holofuel', 'transactions', 'list_pending', agent2)({ origins: originId })
      console.log('matching transaction : ', transaction)
      const { amount } = transaction
      // 2. Agent 2 Offers HF in response to Agent 1's Request
      console.log('>> Whoami: ', whoami(1))
      const payRequest = await createZomeCall('holofuel', 'transactions', 'promise', agent2)({ ...txParams, to: agent1, amount })
      console.log('>> Pay Request Success Hash', payRequest)
      return payRequest
    })

  // Scenario: An offer from agent1 to agent2 which agent 2 has accepted
  // 1. Agent 1 Offers HF from Agent 2
  console.log('>> Whoami: ', whoami(0))
  await createZomeCall('holofuel', 'transactions', 'promise', agent1)({ ...txParams, to: agent2 })
    .then(async (r) => {
      const { Ok: originId } = JSON.parse(r)
      // 2. Agent 2 Accepts HF in response to Agent 1's Offer
      console.log('>> Whoami: ', whoami(1))
      const acceptOffer = await createZomeCall('holofuel', 'transactions', 'receive_payments_pending', agent2)({ promises: originId })
      console.log('.. AcceptOffer Success Hash', acceptOffer)
      return acceptOffer
    })
}

populateData()
