// //////////////////////////////////////////////////////////////////////////////////// //

// HF ACTION FLOWS (for all successful cases):
// ===========================================
// AGENT 1 FLOW:
// (NB: The AGENT 2 FLOW is the same as above with Agent actions inversed.)

// >> Full Request Case
// >>>> Agent 1 Requests HF
// >>>> Agent 2 Offers HF (response to requested)
// >>>> Agent 1 Accepts Offered HF

// >> 2/3 Request Case
// >>>> Agent 1 Requests HF
// >>>> Agent 2 Offers HF (response to requested)

// >> 1/3 Request Case
// >>>> Agent 1 Requests HF

// >> Full Promise Case
// >>>> Agent 1 Offers HF (initiated)
// >>>> Agent 2 Accepts Offered HF

// >> 1/2 Promise Case
// >>>> Agent 1 Offers HF (initiated)

// //////////////////////////////////////////////////////////////////////////////////// //

const Agent1TransactionLedger = require('./agent1-hf-ledger.js')
const Agent2TransactionLedger = require('./agent2-hf-ledger.js')
const { transactHoloFuel, REQUEST, OFFER, PAY, ACCEPT } = require('./transact-holofuel.js')

// HoloFuel Agent Scenario Handler :
const agentScenarioFlow = async (agentTransactionLedger) => {
  console.log(' \n\n\n\n ********************************************************************************************** ')
  console.log(` ${agentTransactionLedger === Agent1TransactionLedger ? 'AGENT 1' : 'AGENT 2'} Scenario Flow `)
  console.log(' ********************************************************************************************** ')

  let CURRENT_AGENT_LEDGER, COUNTERPARTY_LEDGER
  if (agentTransactionLedger === Agent1TransactionLedger) {
    CURRENT_AGENT_LEDGER = Agent1TransactionLedger
    COUNTERPARTY_LEDGER = Agent2TransactionLedger
  } else if (agentTransactionLedger === Agent2TransactionLedger) {
    CURRENT_AGENT_LEDGER = Agent2TransactionLedger
    COUNTERPARTY_LEDGER = Agent1TransactionLedger
  } else {
    throw new Error('Invalid agent number provided : ', agentTransactionLedger)
  }

  const halfArrayLength = (array) => Math.ceil((array.length - 1) / 2)
  const arrayFirstHalf = (array) => array.slice(0, halfArrayLength(array))
  const arraySecondHalf = (array) => array.slice(halfArrayLength(array))
  const halfRequestsLength = halfArrayLength(CURRENT_AGENT_LEDGER.requests)
  const forthRequestsLength = Math.ceil((halfRequestsLength) / 2)
  const halfInitiatingOffersLength = halfArrayLength(CURRENT_AGENT_LEDGER.offers.initated)

  // CASE 1 : Current Agent initiates 1/2 of total REQUESTS, counterparty pays, and current agent Accepts (full-tx-cycle requests)
  const fullRequestCycle = async () => {
    console.log(' \n\n ================================ CASE 1 : Full Request Cycle =========================================== ')
    console.log(' Length of all Initiated Requests: ', CURRENT_AGENT_LEDGER.requests.length)
    const array = CURRENT_AGENT_LEDGER.requests.length <= 1 ? CURRENT_AGENT_LEDGER.requests : arrayFirstHalf(CURRENT_AGENT_LEDGER.requests)
    console.log(' Length of this cycle: ', array.length)
    for (let i = 0; i < array.length; i++) {
      await new Promise(resolve => {
        console.log('\n Full Request Array Iteration Number (index) : ', i)
        let txOriginId
        // Agent 1 Requests HF
        // AGENT_1_DNA_INSTANCE
        transactHoloFuel(CURRENT_AGENT_LEDGER, REQUEST, { index: i })
        // Agent 2 Offers HF in response to Agent 1's request
          .then(r => {
            const { Ok: originId } = JSON.parse(r)
            txOriginId = originId
            // AGENT_2_DNA_INSTANCE
            return transactHoloFuel(COUNTERPARTY_LEDGER, PAY, { transactionTrace: i, originId })
          })
          // Agent 1 Accepts HF offered by Agent 2 and completes originating Request
          // AGENT_1_DNA_INSTANCE
          .then(res => {
            setTimeout(() => resolve(transactHoloFuel(CURRENT_AGENT_LEDGER, ACCEPT, { originId: txOriginId })), 5000)
          })
          .catch(error => { return error })
      })
    }
  }

  // CASE 2 : Current Agent initiates the third forth of total REQUESTS & counterparty offers to pay (2/3 tx-cycle requests)
  const twoPartsRequestCycle = async () => {
    console.log('  \n\n ================================ CASE 2 : Two Parts Request Cycle =========================================== ')
    console.log(' Length of all Initiated Requests: ', CURRENT_AGENT_LEDGER.requests.length)
    if (CURRENT_AGENT_LEDGER.requests.length <= 1) { return console.log('The REQUEST array has less than 2 entries, this case is being skipped...') }

    const array = arraySecondHalf(CURRENT_AGENT_LEDGER.requests).length <= 1 ? arraySecondHalf(CURRENT_AGENT_LEDGER.requests) : arrayFirstHalf(arraySecondHalf(CURRENT_AGENT_LEDGER.requests))
    console.log(' Length of this cycle: ', array.length)
    for (let i = 0; i < array.length; i++) {
      await new Promise(resolve => {
        const index = i + halfRequestsLength
        console.log('\n Full Request Array Iteration Number (index) : ', index)
        console.log('\n MAKING CALL TO REQUEST')
        // Current Agent Requests HF
        transactHoloFuel(CURRENT_AGENT_LEDGER, REQUEST, { index })
          // Transactee Agent Offers HF in response to Current Agent's request
          .then(r => {
            const { Ok: originId } = JSON.parse(r)
            resolve(transactHoloFuel(COUNTERPARTY_LEDGER, PAY, { transactionTrace: index, originId }))
          })
          .catch(error => { return error })
      })
    }
  }

  // CASE 3 : Current Agent initiates last forth of total REQUESTS & requests remain pending (1/3 tx-cycle requests)
  const onePartRequestCycle = async () => {
    console.log(' \n\n ================================== CASE 3 : One Part Request Cycle =========================================== ')
    console.log(' Length of all Initiated Requests: ', CURRENT_AGENT_LEDGER.requests.length)
    if (arraySecondHalf(CURRENT_AGENT_LEDGER.requests).length <= 1) { return console.log('The REQUEST array has less than 4 entries, this case is being skipped...') }

    console.log(' Length of this cycle: ', arraySecondHalf(arraySecondHalf(CURRENT_AGENT_LEDGER.requests)).length)
    for (let i = 0; i < arraySecondHalf(arraySecondHalf(CURRENT_AGENT_LEDGER.requests)).length; i++) {
      await new Promise(resolve => {
        const index = i + halfRequestsLength + forthRequestsLength
        console.log('\n Full Request Array Iteration Number (index) : ', index)
        // Current Agent Requests HF
        resolve(transactHoloFuel(CURRENT_AGENT_LEDGER, REQUEST, { index }))
      })
        .catch(error => { return error })
    }
  }

  // CASE 4 : Current Agent initiates 1/2 of total PROMISES & counterparty Accepts them (full-tx-cycle offers)
  const fullOfferCycle = async () => {
    console.log(' \n\n ================================== CASE 4 : Full Offer Cycle =========================================== ')
    console.log(' Length of all Initiated Promises: ', CURRENT_AGENT_LEDGER.offers.initated.length)
    const array = CURRENT_AGENT_LEDGER.offers.initated.length <= 1 ? CURRENT_AGENT_LEDGER.offers.initated : arrayFirstHalf(CURRENT_AGENT_LEDGER.offers.initated)
    console.log(' Length of this cycle: ', array.length)
    for (let i = 0; i < array.length; i++) {
      await new Promise(resolve => {
        console.log('\n Full Offer Array Iteration Number (index) : ', i)
        // Current Agent Offers HF
        transactHoloFuel(CURRENT_AGENT_LEDGER, OFFER, { index: i })
          // Transactee Accepts HF offered by Current Agent and completes originating Promise/Offer
          .then(r => {
            const { Ok: originId } = JSON.parse(r)
            setTimeout(() => resolve(transactHoloFuel(COUNTERPARTY_LEDGER, ACCEPT, { transactionTrace: i, originId })), 5000)
          })
          .catch(error => { return error })
      })
    }
  }

  // CASE 5 : Current Agent initiates 1/2 of total PROMISES & promises remain pending (1/2 tx-cycle offers)
  const halfOfferCycle = async () => {
    console.log(' \n\n ================================== CASE 5 : Half Offer Cycle =========================================== ')
    console.log(' Length of all Initiated Promises: ', CURRENT_AGENT_LEDGER.offers.initated.length)
    if (CURRENT_AGENT_LEDGER.offers.initated.length <= 1) { console.log('The OFFER / PROMISE array has less than 2 entries, this case is being skipped...'); process.exit() }

    console.log(' Length of this cycle: ', arraySecondHalf(CURRENT_AGENT_LEDGER.offers.initated).length)
    for (let i = 0; i < arraySecondHalf(CURRENT_AGENT_LEDGER.offers.initated).length; i++) {
      await new Promise(resolve => {
        const index = i + halfInitiatingOffersLength
        console.log('\n Full Offer Array Iteration Number (index) : ', index)

        // Current Agent Offers HF
        resolve(transactHoloFuel(CURRENT_AGENT_LEDGER, OFFER, { index }))
      })
        .catch(error => { return error })
    }
  }

  // Invoke Individual Transaction Cases for Agents
  await fullRequestCycle()
  await twoPartsRequestCycle()
  await onePartRequestCycle()
  await fullOfferCycle()
  await halfOfferCycle()
}

module.exports = agentScenarioFlow
