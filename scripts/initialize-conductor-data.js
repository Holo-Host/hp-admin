const createZomeCall = require('./create-zome-call')
const { getAgent } = require('../src/utils/conductorConfig')
const moment = require('moment')
const util = require('util')
const ncp = util.promisify(require('ncp').ncp)
require('dotenv').config()

const randomNumber = (number = 10000) => {
  return Math.round(Math.random() * number)
}

const txParams = {
  amount: randomNumber,
  notes: 'Pre-Seed Data',
  deadline: moment().subtract(10, 'days').toISOString()
}

function snapshotStrorage () {
  return ncp(process.env.REACT_APP_DEFAULT_STORAGE, process.env.REACT_APP_STORAGE_SNAPSHOT)
}

async function populateData () {
  const agent1 = getAgent()
  const agent2 = getAgent(1)
  const whois = (agent) => createZomeCall('holofuel', 'transactions', 'whois')({ agents: agent.id })
  let whoisResult = await whois(agent1)
  console.log('result of zome call', whoisResult)

  // Seed Data:
  // Scenario: A request from agent2 to agent1
  whoisResult = await whois(agent2)
  console.log('Agent 2 sends Request to Agent 1')
  console.log('>> Agent #2: ', whoisResult)
  const initiateRequest = await createZomeCall('holofuel', 'transactions', 'request', agent2)({ ...txParams, from: agent1 })
  console.log('>> Initiate Request Success Hash', initiateRequest)

  // Scenario: An offer from agent2 to agent1
  whoisResult = await whois(agent2)
  console.log('\n Agent 2 sends Offer to Agent 1')
  console.log('>> Agent #2: ', whoisResult)
  const initiateOffer = await createZomeCall('holofuel', 'transactions', 'promise', agent2)({ ...txParams, to: agent1 })
  console.log('>> Initiate Request Success Hash', initiateOffer)

  // Scenario: A request from agent1 to agent2 which agent 2 has paid :
  // 1. Agent 1 request HF from Agent 2
  whoisResult = await whois(agent1)
  console.log('\n Agent 2 recieves and pays Offer originally requested by Agent 1')
  console.log('>> Agent #1: ', whoisResult)
  await createZomeCall('holofuel', 'transactions', 'request', agent1)({ ...txParams, from: agent2 })
    .then(async (r) => {
      const { Ok: originId } = JSON.parse(r)
      const transaction = await createZomeCall('holofuel', 'transactions', 'list_pending', agent2)({ origins: originId })
      console.log('matching transaction : ', transaction)
      const { amount } = transaction
      // 2. Agent 2 Offers HF in response to Agent 1's Request
      const payRequest = await createZomeCall('holofuel', 'transactions', 'promise', agent2)({ ...txParams, to: agent1, amount })
      console.log('>> Pay Request Success Hash', payRequest)
      return payRequest
    })

  // Scenario: An offer from agent1 to agent2 which agent 2 has accepted
  // 1. Agent 1 Offers HF from Agent 2
  whoisResult = await whois(agent1)
  console.log('\n Agent 2 accepts Offer originally offered by Agent 1')
  console.log('>> Agent #1: ', whoisResult)
  await createZomeCall('holofuel', 'transactions', 'promise', agent1)({ ...txParams, to: agent2 })
    .then(async (r) => {
      const { Ok: originId } = JSON.parse(r)
      // 2. Agent 2 Accepts HF in response to Agent 1's Offer
      const acceptOffer = await createZomeCall('holofuel', 'transactions', 'receive_payments_pending', agent2)({ promises: originId })
      console.log('.. AcceptOffer Success Hash', acceptOffer)
      return acceptOffer
    })
}

populateData()
  .then(() => snapshotStrorage())
  .then(() => process.exit())
  .catch(e => {
    console.log('error', e)
    process.exit(-1)
  })

module.exports = {
  DEFAULT_STORAGE,
  STORAGE_SNAPSHOT
}