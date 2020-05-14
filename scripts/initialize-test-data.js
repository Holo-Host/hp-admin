const createZomeCall = require('./create-zome-call')
const { agent1, agent2 } = require('./read-test-conductor')
const moment = require('moment')
const util = require('util')
const ncp = util.promisify(require('ncp').ncp)
const rimraf = require('rimraf')
const wait = require('waait')
const { DEFAULT_HOLOCHAIN_STORAGE, SNAPSHOT_HOLOCHAIN_STORAGE } = require('./consts')
require('dotenv').config()

const txParams = {
  amount: '100',
  notes: 'Pre-Seed Data',
  deadline: moment().subtract(10, 'days').toISOString()
}

async function snapshotStorage () {
  await ncp(DEFAULT_HOLOCHAIN_STORAGE, SNAPSHOT_HOLOCHAIN_STORAGE)

  return new Promise((resolve, reject) => {
    rimraf(DEFAULT_HOLOCHAIN_STORAGE, (e) => {
      if (e) reject(e)
      resolve()
    })
  })
}

async function populateHoloFuelData () {
  // Seed Data:
  // 1.) Scenario: Some requests from agent1 to agent2
  console.log('\nTEST SCENARIO #1 : Agent 1 sends Request to Agent 2')
  const createMultipleRequests = async (volumeOfTransactions = 1, amount = 100) => {
    console.log('volume of transactions : ', volumeOfTransactions)
    for (let i = 0; i < volumeOfTransactions; i++) {
      amount++
      const agent1InitiateRequest = await createZomeCall('holofuel', 'transactions', 'request')({ ...txParams, from: agent2.id, amount: amount.toString() })
      console.log(' >> Agent 1 Initiate Request Success Hash', agent1InitiateRequest)
      console.log('\n')
    }
  }
  await createMultipleRequests(1)

  // 2.) Scenario: An offer from agent1 to agent2
  console.log('\nTEST SCENARIO #2 : Agent 1 Offers hf to Agent 2')
  const createMultipleOffers = async (volumeOfTransactions = 1, amount = 200) => {
    console.log('volume of transactions : ', volumeOfTransactions)
    for (let i = 0; i < volumeOfTransactions; i++) {
      amount++
      const agent1InnitiateOffer = await createZomeCall('holofuel', 'transactions', 'promise')({ ...txParams, to: agent2.id, amount: amount.toString() })
      console.log(' >> Initiate Request Success Hash', agent1InnitiateOffer)
      console.log('\n')
    }
  }
  await createMultipleOffers(1)

  // 3.) Scenario: A request from agent2 to agent1
  console.log('\nTEST SCENARIO #3 : Agent 2 Requests hf from Agent 1')
  const agent2InitiateRequest = await createZomeCall('holofuel-2', 'transactions', 'request')({ ...txParams, from: agent1.id, amount: '300' })
  console.log(' >> Agent 2 Initiate Request Success Hash', agent2InitiateRequest)

  // 4.) Scenario: An offer from agent2 to agent1
  console.log('\nTEST SCENARIO #4 : Agent 2 Offers hf to Agent 1')
  const agent2InitiateOffer = await createZomeCall('holofuel-2', 'transactions', 'promise')({ ...txParams, to: agent1.id, amount: '400' })
  console.log(' >> Initiate Request Success Hash', agent2InitiateOffer)

  // 5.) Scenario: An offer from agent1 to agent2 which agent 2 accepts
  // Part 1) : Agent 1 Offers HF from Agent 2
  console.log('\nTEST SCENARIO #5 : Agent 2 accepts HF Offer by Agent 1')
  await createZomeCall('holofuel', 'transactions', 'promise')({ ...txParams, to: agent2.id, amount: '500' })
    .then(async (r) => {
      const { Ok: originId } = JSON.parse(r)
      console.log('transaction originId : ', originId)
      await wait(6000)
      console.log('Part 2 :')
      // // Part 2) : Agent 2 Accepts HF in response to Agent 1's Offer
      const acceptOffer = await createZomeCall('holofuel-2', 'transactions', 'receive_payments_pending')({ promises: originId })
      console.log(' >> Accept Offer Success Hash', acceptOffer)
      return acceptOffer
    })

  // 7.) Scenario: A Request from agent1 to agent2 which agent 2 has paid (accepted to pay)
  // Part 1) : Agent 1 Requests HF from Agent 2
  console.log('\nTEST SCENARIO #7 : Agent 2 accepts HF Request by Agent 1')
  await createZomeCall('holofuel', 'transactions', 'request')({ ...txParams, from: agent2.id, amount: '800' })
    .then(async (r) => {
      const { Ok: originId } = JSON.parse(r)
      console.log('transaction originId : ', originId)
      await wait(6000)
      console.log('Part 2 :')
      // // Part 2) : Agent 2 Accepts HF in response to Agent 1's Request
      const payRequest = await createZomeCall('holofuel-2', 'transactions', 'promise')({ ...txParams, to: agent1.id, amount: '800', request: originId })
      console.log(' >> Accept Request Success Hash', payRequest)
      return payRequest
    })
}

populateHoloFuelData()
  .then(() => console.log('Finished loading HoloFuel data...'))
  .then(() => snapshotStorage())
  .then(() => console.log('Saved Snapshot Storage'))
  .then(() => process.exit())
  .catch(e => {
    console.log('error', e)
    process.exit(-1)
  })
