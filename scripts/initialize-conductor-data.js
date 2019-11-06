const createZomeCall = require('./create-zome-call')
const { getAgent } = require('../src/utils/integration-testing/conductorConfig')
const moment = require('moment')
// const _ = require('lodash/fp')
const util = require('util')
const ncp = util.promisify(require('ncp').ncp)
const wait = require('waait')
const { promiseMap, createAndRegister, happConfigKeys } = require('./RunHhaProviderFlow')
const { providerShims, HAPP_STORE_DNA_INSTANCE, HHA_DNA_INSTANCE } = require('./RunHhaProviderFlow/provider-shims.js')
require('dotenv').config()

const txParams = {
  amount: '100',
  notes: 'Pre-Seed Data',
  deadline: moment().subtract(10, 'days').toISOString()
}

function snapshotStrorage () {
  return ncp(process.env.REACT_APP_DEFAULT_STORAGE, process.env.REACT_APP_STORAGE_SNAPSHOT)
}

async function populateHoloFuelData () {
  const agent1Index = 0
  const agent2Index = 1
  const agent1 = getAgent(agent1Index)
  const agent2 = getAgent(agent2Index)

  // Seed Data:
  // 1.) Scenario: A request from agent1 to agent2
  const agent1InitiateRequest = await createZomeCall('holofuel', 'transactions', 'request', agent1Index)({ ...txParams, to: agent1.id, from: agent2.id })
  console.log('\nTEST SCENARIO #1 : Agent 1 sends Request to Agent 2')
  console.log(' >> Agent 1 Initiate Request Success Hash', agent1InitiateRequest)

  // 2.) Scenario: A request from agent2 to agent1
  console.log('\nTEST SCENARIO #2 : Agent 2 Requests hf from Agent 1')
  const agent2InitiateRequest = await createZomeCall('holofuel', 'transactions', 'request', agent1Index)({ ...txParams, to: agent2.id, from: agent1.id, amount: '200' })
  console.log(' >> Agent 2 Initiate Request Success Hash', agent2InitiateRequest)

  // // 3.) Scenario: An offer from agent2 to agent1
  // console.log('\nTEST SCENARIO #3 : Agent 2 Offers hf to Agent 1')
  // const initiateOffer = await createZomeCall('holofuel', 'transactions', 'promise', agent2Index)({ ...txParams, to: agent1.id, amount: '300' })
  // console.log(' >> Initiate Request Success Hash', initiateOffer)

  // // 4.) Scenario: A request from agent1 to agent2, which agent 2 has paid :
  // // Part 1) : Agent 1 request HF from Agent 2
  // console.log('\nTEST SCENARIO #4 : Agent 2 receives Request from Agent 1 and Offers payment')
  // await createZomeCall('holofuel', 'transactions', 'request', agent1Index)({ ...txParams, to: agent1.id, from: agent2.id, amount: '400' })
  //   .then(async (r) => {
  //     const { Ok: originId } = JSON.parse(r)
  //     console.log(' Transaction `originId` : ', originId)
  //     console.log('Waiting to allow for data propagation...')
  //     await wait(6000)
  //     console.log(' Part 1, Step 2 : searching to find pending transaction....')
  //     const response = await createZomeCall('holofuel', 'transactions', 'list_pending', agent2Index)({ origins: originId })
  //     const jsonResult = JSON.parse(response)
  //     const transaction = _.get('Ok.requests[0].event[2].Request', jsonResult)
  //     console.log(' Matching Transaction : ', transaction)
  //     const { amount } = transaction
  //     console.log(' Part 2 :')
  //     // // Part 2) : Agent 2 Offers HF in response to Agent 1's Request
  //     const payRequest = await createZomeCall('holofuel', 'transactions', 'promise', agent1Index)({ ...txParams, to: agent1.id, from: agent2.id, amount })
  //     console.log(' >> Pay Request Success Hash', payRequest)
  //     return payRequest
  //   })

  // // 5.) Scenario: An offer from agent1 to agent2 which agent 2 has accepted
  // // Part 1) : Agent 1 Offers HF from Agent 2
  // console.log('\nTEST SCENARIO #5 : Agent 2 accepts HF Offer by Agent 1')
  // await createZomeCall('holofuel', 'transactions', 'promise', agent1Index)({ ...txParams, to: agent2.id, amount: '500' })
  //   .then(async (r) => {
  //     const { Ok: originId } = JSON.parse(r)
  //     console.log('transaction originId : ', originId)
  //     await wait(6000)
  //     console.log('Part 2 :')
  //     // // Part 2) : Agent 2 Accepts HF in response to Agent 1's Offer
  //     const acceptOffer = await createZomeCall('holofuel', 'transactions', 'receive_payments_pending', agent2Index)({ promises: originId })
  //     console.log(' >> AcceptOffer Success Hash', acceptOffer)
  //     return acceptOffer
  //   })

  console.log('Waiting to allow for data propagation...')
  await wait(0)
  console.log('\n\n*****************')
  // Agent 1 Ledger Check :
  console.log('\nAgent 1 Ledger Check')
  const agent1LedgerState = await createZomeCall('holofuel', 'transactions', 'ledger_state', agent1Index)()
  console.log('>> Initiate Request Success Hash', agent1LedgerState)

  // Agent 2 Ledger Check :
  console.log('\nAgent 2 Ledger Check')
  const agent2LedgerState = await createZomeCall('holofuel', 'transactions', 'ledger_state', agent2Index)()
  console.log('>> Initiate Request Success Hash', agent2LedgerState)
  console.log('\n\n*****************')

  return wait(0)
}

const populateHpAdminData = async () => {
  console.log('\n ************************************************************* ')
  console.log(' HAPP_STORE_DNA_INSTANCE : ', HAPP_STORE_DNA_INSTANCE)
  console.log(' HHA_DNA_INSTANCE : ', HHA_DNA_INSTANCE)
  console.log(' ************************************************************* \n')

  const registerProvider = new Promise((resolve) => resolve(providerShims.registerAsProvider()))
  const fillHappStore = () => promiseMap(happConfigKeys, happId => createAndRegister(happId))

  return registerProvider
    .then(_ => fillHappStore())
    .then(_ => providerShims.addHolofuelAccount())
    // .then(_ => process.exit())
    .catch(e => console.log('Error when registering Provider. >> ERROR : ', e))
}

populateHoloFuelData()
  .then(() => console.log('Finished loading HoloFuel data...'))
  .then(() => populateHpAdminData())
  .then(() => console.log('Finished loading HPAdmin data...'))
  .then(() => snapshotStrorage())
  .then(() => console.log('Loaded Snapshot Storage'))
  .then(() => process.exit())
  .catch(e => {
    console.log('error', e)
    process.exit(-1)
  })
