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
  // amount: '100',
  amount: randomNumber().toString(),
  notes: 'Pre-Seed Data',
  deadline: moment().subtract(10, 'days').toISOString()
}

function snapshotStrorage () {
  return ncp(process.env.REACT_APP_DEFAULT_STORAGE, process.env.REACT_APP_STORAGE_SNAPSHOT)
}

async function populateData () {
  const agent1Index = 0
  const agent2Index = 1
  const agent1 = getAgent(agent1Index)
  const agent2 = getAgent(agent2Index)

  // Seed Data:
  // Scenario: A request from agent2 to agent1
  console.log('Agent 2 sends Request to Agent 1')
  const initiateRequest = await createZomeCall('holofuel', 'transactions', 'request', agent1Index)({ ...txParams, to: agent2.id, from: agent1.id })
  console.log('>> Initiate Request Success Hash', initiateRequest)

  // // Scenario: An offer from agent2 to agent1
  // console.log('\n Agent 2 sends Offer to Agent 1')
  // const initiateOffer = await createZomeCall('holofuel', 'transactions', 'promise', agent2Index)({ ...txParams, to: agent1.id })
  // console.log('>> Initiate Request Success Hash', initiateOffer)

  // // Scenario: A request from agent1 to agent2 which agent 2 has paid :
  // // 1. Agent 1 request HF from Agent 2
  // console.log('\n Agent 2 recieves and pays Offer originally requested by Agent 1')
  // await createZomeCall('holofuel', 'transactions', 'request', agent1Index)({ ...txParams, from: agent2.id })
  //   .then(async (r) => {
  //     const { Ok: originId } = JSON.parse(r)
  //     const transaction = await createZomeCall('holofuel', 'transactions', 'list_pending', agent2Index)({ origins: originId })
  //     console.log('matching transaction : ', transaction)
  //     const { amount } = transaction
  //     // 2. Agent 2 Offers HF in response to Agent 1's Request
  //     const payRequest = await createZomeCall('holofuel', 'transactions', 'promise', agent2Index)({ ...txParams, to: agent1.id, amount })
  //     console.log('>> Pay Request Success Hash', payRequest)
  //     return payRequest
  //   })

  // // Scenario: An offer from agent1 to agent2 which agent 2 has accepted
  // // 1. Agent 1 Offers HF from Agent 2
  // console.log('\n Agent 2 accepts Offer originally offered by Agent 1')
  // await createZomeCall('holofuel', 'transactions', 'promise', agent1Index)({ ...txParams, to: agent2.id })
  //   .then(async (r) => {
  //     const { Ok: originId } = JSON.parse(r)
  //     // 2. Agent 2 Accepts HF in response to Agent 1's Offer
  //     const acceptOffer = await createZomeCall('holofuel', 'transactions', 'receive_payments_pending', agent2Index)({ promises: originId })
  //     console.log('.. AcceptOffer Success Hash', acceptOffer)
  //     return acceptOffer
  //   })
}

populateData()
  .then(() => snapshotStrorage())
  .then(() => process.exit())
  .catch(e => {
    console.log('error', e)
    process.exit(-1)
  })

// //
// Node REPL Script to test out calls :
// const { connect } = require('@holochain/hc-web-client')
//
// const args = {
//   from: 'HcScJNpnC8kabp59w89Z9GhfHw7VdycrmZP7yaBAP7i3sxynx6KO8Pvm3ai6iiz::<happ_id>-holofuel',
//   amount: '100',
//   notes: 'Pre-Seed Data',
//   deadline: '2042-01-01'
// }
//
// connect({ url: 'ws://localhost:3400' }).then(({ callZome}) => callZome('HcScJNpnC8kabp59w89Z9GhfHw7VdycrmZP7yaBAP7i3sxynx6KO8Pvm3ai6iiz::<happ_id>-holofuel', 'transactions', 'request')({ args })).then(result => console.log('result', result))
// //
