const { Agent1, Agent2 } = require('../get-agent.js')
const Agent1TransactionLedger = require('./agent1-hf-ledger.js')
const Agent2TransactionLedger = require('./agent2-hf-ledger.js')
const holochainZomeCall = require('../invoke-holochain-zome-call.js')

// Transaction Types :
const REQUEST = 'requests'
const OFFER = 'offers.initated'
const PAY = 'offers.responding'
const ACCEPT = 'offers.accepted'

// HoloFuel ZomeCall Handler :
const transactHoloFuel = (agentTransactionLedger, type, { index, transactionTrace, originId }) => {
  let currentAgent, counterparty
  if (agentTransactionLedger === Agent1TransactionLedger) {
    counterparty = Agent2.id
    currentAgent = 0
  } else {
    counterparty = Agent1.id
    currentAgent = 1
  }

  const txType = type === OFFER ? agentTransactionLedger.offers.initated : agentTransactionLedger[type]
  let origininatingTx = null
  if (transactionTrace || transactionTrace === 0) {
    // For payment of a request :
    const otherAgent = agentTransactionLedger === Agent1TransactionLedger ? Agent2TransactionLedger : Agent1TransactionLedger
    origininatingTx = otherAgent[REQUEST][transactionTrace]
  }

  switch (type) {
    case REQUEST: {
      console.log('\n INVOKING REQUEST CALL ****************************')
      console.log(' > Current Agent : ', currentAgent)
      // initate request
      return holochainZomeCall(
        'holofuel',
        'transactions',
        'request',
        {
          from: counterparty,
          amount: txType[index].amount,
          notes: txType[index].notes,
          deadline: txType[index].deadline
        },
        currentAgent
      )
    }
    case OFFER: {
      console.log('\n INVOKING OFFER CALL ****************************')
      console.log(' > Current Agent : ', currentAgent)
      // initiate offer
      return holochainZomeCall(
        'holofuel',
        'transactions',
        'promise',
        {
          to: counterparty,
          amount: txType[index].amount,
          notes: txType[index].notes,
          deadline: txType[index].deadline
        },
        currentAgent
      )
    }
    case PAY: {
      console.log('\n INVOKING PAY CALL ****************************')
      console.log(' > Current Agent : ', currentAgent)
      // offer in response to request
      return holochainZomeCall(
        'holofuel',
        'transactions',
        'promise',
        {
          to: counterparty,
          amount: origininatingTx.amount,
          notes: 'Here is your Fuel!',
          deadline: origininatingTx.deadline,
          requestId: originId
        },
        currentAgent
      )
    }
    case ACCEPT: {
      console.log('\n INVOKING ACCEPT CALL ****************************')
      console.log(' > Current Agent : ', currentAgent)
      // accept offer
      return holochainZomeCall(
        'holofuel',
        'transactions',
        'receive_payments_pending',
        {
          promises: originId
        },
        currentAgent
      )
    }
    default:
      throw new Error('Error: No transaction TYPE was matched. Current transaction type : ', type)
  }
}

module.exports = {
  transactHoloFuel,
  REQUEST,
  OFFER,
  PAY,
  ACCEPT
}
