const createZomeCall = require('./create-zome-call')
const { agent1, agent2 } = require('./read-test-conductor')
const moment = require('moment')
const util = require('util')
const ncp = util.promisify(require('ncp').ncp)
const wait = require('waait')
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
  // Seed Data:
  // 1.) Scenario: A request from agent1 to agent2
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
  await createMultipleRequests(5)

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
  await createMultipleOffers(3)

  // 3.) Scenario: A request from agent2 to agent1
  console.log('\nTEST SCENARIO #3 : Agent 2 Requests hf from Agent 1')
  const agent2InitiateRequest = await createZomeCall('holofuel-2', 'transactions', 'request')({ ...txParams, from: agent1.id, amount: '300' })
  console.log(' >> Agent 2 Initiate Request Success Hash', agent2InitiateRequest)

  // 4.) Scenario: An offer from agent2 to agent1
  console.log('\nTEST SCENARIO #4 : Agent 2 Offers hf to Agent 1')
  const agent2InitiateOffer = await createZomeCall('holofuel-2', 'transactions', 'promise')({ ...txParams, to: agent1.id, amount: '400' })
  console.log(' >> Initiate Request Success Hash', agent2InitiateOffer)

  // 5.) Scenario: An offer from agent1 to agent2 which agent 2 has accepted
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

  // 6.) Scenario: An offer from agent1 to agent2 which agent 2 has declined
  // Part 1) : Agent 1 Offers HF from Agent 2
  console.log('\nTEST SCENARIO #6 : Agent 2 accepts HF Offer by Agent 1')
  await createZomeCall('holofuel', 'transactions', 'promise')({ ...txParams, to: agent2.id, amount: '600' })
    .then(async (r) => {
      const { Ok: originId } = JSON.parse(r)
      console.log('transaction originId : ', originId)
      await wait(6000)
      console.log('Part 2 :')
      // // Part 2) : Agent 2 Declines HF in response to Agent 1's Offer
      const declineOffer = await createZomeCall('holofuel-2', 'transactions', 'decline_pending')({ origins: originId })
      console.log(' >> Decline Offer Success Hash', declineOffer)
      return declineOffer
    })

  // 7.) Scenario: An offer from agent1 to agent2 which agent 1 has cancelled
  // Part 1) : Agent 1 Offers HF from Agent 2
  console.log('\nTEST SCENARIO #7 : Agent 2 accepts HF Offer by Agent 1')
  await createZomeCall('holofuel', 'transactions', 'promise')({ ...txParams, to: agent2.id, amount: '700' })
    .then(async (r) => {
      const { Ok: originId } = JSON.parse(r)
      console.log('transaction originId : ', originId)
      await wait(6000)
      console.log('Part 2 :')
      // // Part 2) : Agent 1 Cancels own Offer to Agent 2
      const cancelOffer = await createZomeCall('holofuel', 'transactions', 'cancel_transactions')({ origins: originId })
      console.log(' >> Cancel Offer Success Hash', cancelOffer)
      return cancelOffer
    })

  // 8.) Scenario: An Request from agent1 to agent2 which agent 2 has paid (accepted to pay)
  // Part 1) : Agent 1 Requests HF from Agent 2
  console.log('\nTEST SCENARIO #8 : Agent 2 accepts HF Request by Agent 1')
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

  // 9.) Scenario: An Request from agent1 to agent2 which agent 2 has declined to pay
  // Part 1) : Agent 1 Requests HF from Agent 2
  console.log('\nTEST SCENARIO #9 : Agent 2 accepts HF Request by Agent 1')
  await createZomeCall('holofuel', 'transactions', 'request')({ ...txParams, from: agent2.id, amount: '900' })
    .then(async (r) => {
      const { Ok: originId } = JSON.parse(r)
      console.log('transaction originId : ', originId)
      await wait(6000)
      console.log('Part 2 :')
      // // Part 2) : Agent 2 Declines HF in response to Agent 1's Request
      const declineRequest = await createZomeCall('holofuel-2', 'transactions', 'decline_pending')({ origins: originId })
      console.log(' >> Decline Request Success Hash', declineRequest)
      return declineRequest
    })

  // 10.) Scenario: An Request from agent1 to agent2 which agent 1 has cancelled
  // Part 1) : Agent 1 Cance;s Requests HF from Agent 2
  console.log('\nTEST SCENARIO #10 : Agent 2 accepts HF Request by Agent 1')
  await createZomeCall('holofuel', 'transactions', 'request')({ ...txParams, from: agent2.id, amount: '1000' })
    .then(async (r) => {
      const { Ok: originId } = JSON.parse(r)
      console.log('transaction originId : ', originId)
      await wait(6000)
      console.log('Part 2 :')
      // // Part 2) : Agent 1 Cancels own Request to Agent 2
      const cancelRequest = await createZomeCall('holofuel', 'transactions', 'cancel_transactions')({ origins: originId })
      console.log(' >> Cancel Request Success Hash', cancelRequest)
      return cancelRequest
    })

  // // 11.) Scenario: A request from agent1 to agent2, which agent 2 has paid and agent1 Accepts:
  // // Part 1) : Agent 1 accpets requested HF from Agent 2
  // console.log('\nTEST SCENARIO #11 : Agent 1 accepts Paid Request from Agent 2')
  // await createZomeCall('holofuel', 'transactions', 'request')({ ...txParams, from: agent2.id, amount: '1100' })
  //   .then(async (r) => {
  //     const { Ok: originId } = JSON.parse(r)
  //     console.log('transaction originId : ', originId)
  //     await wait(6000)
  //     console.log('Part 2 :')
  //     // Part 2) : Agent 2 Pays HF in response to Agent 1's Request
  //     const payRequest = await createZomeCall('holofuel-2', 'transactions', 'promise')({ ...txParams, to: agent1.id, amount: '1100', request: originId })
  //     console.log(' >> Pay Request Success Hash', payRequest)
  //     // Part 3) : Agent 2 Accepts HF in response to Agent 1's Request
  //     const acceptPaidRequest = await createZomeCall('holofuel', 'transactions', 'receive_payments_pending')({ promises: originId })
  //     console.log(' >> Accept Paid Request Success Hash', acceptPaidRequest)
  //     return acceptPaidRequest
  //   })

  // // 12.) Scenario: A request from agent1 to agent2, which agent 2 has paid, agent1 Declines AND Agent2 Cancels:
  // // Part 1) : Agent 1 declines paid request HF from Agent 2; agent 2 cancels outstanding payment
  // console.log('\nTEST SCENARIO #12 : Agent 1 declines Paid Request from Agent 2 and Agent 2 cancels outstanding declined payment')
  // await createZomeCall('holofuel', 'transactions', 'request')({ ...txParams, from: agent2.id, amount: '1100' })
  //   .then(async (r) => {
  //     const { Ok: originId } = JSON.parse(r)
  //     console.log('transaction originId : ', originId)
  //     await wait(6000)
  //     console.log('Part 2 :')
  //     // Part 2) : Agent 2 Pays HF in response to Agent 1's Request
  //     const payRequest = await createZomeCall('holofuel-2', 'transactions', 'promise')({ ...txParams, to: agent1.id, amount: '1100', request: originId })
  //     console.log(' >> Pay Request Success Hash', payRequest)
  //     // Part 3) : Agent 2 Accepts HF in response to Agent 1's Request
  //     const declinePaidRequest = await createZomeCall('holofuel', 'transactions', 'decline_pending')({ origins: originId })
  //     console.log(' >> Decline Paid Request Success Hash', declinePaidRequest)
  //     return declinePaidRequest
  //   })

  console.log('Waiting to allow for data propagation...')
  await wait(0)
  console.log('\n\n*****************')
  // Agent 1 Ledger Check :
  console.log('\nAgent 1 Ledger Check')
  const agent1LedgerState = await createZomeCall('holofuel', 'transactions', 'ledger_state')()
  console.log('>> Initiate Request Success Hash', agent1LedgerState)

  // Agent 2 Ledger Check :
  console.log('\nAgent 2 Ledger Check')
  const agent2LedgerState = await createZomeCall('holofuel-2', 'transactions', 'ledger_state')()
  console.log('>> Initiate Request Success Hash', agent2LedgerState)
  console.log('\n\n*****************')

  return wait(0)
}

populateHoloFuelData()
  .then(() => console.log('Finished loading HoloFuel data...'))
  .then(() => snapshotStrorage())
  .then(() => console.log('Loaded Snapshot Storage'))
  .then(() => process.exit())
  .catch(e => {
    console.log('error', e)
    process.exit(-1)
  })
