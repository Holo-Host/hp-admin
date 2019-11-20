const { Agent1, Agent2 } = require('./agent-config.js')
const Agent1TransactionLedger = require('./agent1-hf-ledger.js')
const Agent2TransactionLedger = require('./agent2-hf-ledger.js')
const holochainZomeCall = require('../invoke-holochain-zome-call.js')

// TODO: INCLUDE DNA INSTANCE `AGENT_2_DNA_INSTANCE` ONCE RELIABLE NETWORKING IS IN PLACE....
const { AGENT_1_DNA_INSTANCE } = require('./agent-config.js') // { AGENT_1_DNA_INSTANCE, AGENT_2_DNA_INSTANCE }

// Transaction Types :
const REQUEST = 'requests'
const OFFER = 'offers.initated'
const PAY = 'offers.responding'
const ACCEPT = 'offers.accepted'

// HoloFuel ZomeCall Handler :
const transactHoloFuel = (agentTransactionLedger, type, { index, transactionTrace, originId }) => {
  let DNA_INSTANCE, counterparty
  if (agentTransactionLedger === Agent1TransactionLedger) {
    counterparty = Agent2.agentId
    DNA_INSTANCE = AGENT_1_DNA_INSTANCE
  } else {
    counterparty = Agent1.agentId
    // TODO: Comment back in DNA Instance below with `AGENT_2_DNA_INSTANCE` ASAP.
    // DNA_INSTANCE = AGENT_2_DNA_INSTANCE
    DNA_INSTANCE = AGENT_1_DNA_INSTANCE
  }

  const txType = type === OFFER ? agentTransactionLedger[`offers`][`initated`] : agentTransactionLedger[type]
  let origininatingTx = null
  if (transactionTrace || transactionTrace === 0) {
    // For payment of a request :
    const otherAgent = agentTransactionLedger === Agent1TransactionLedger ? Agent2TransactionLedger : Agent1TransactionLedger
    origininatingTx = otherAgent[REQUEST][transactionTrace]
  }

  switch (type) {
    case REQUEST: {
      console.log('\n INVOKING REQUEST CALL ****************************')
      console.log(' > DNA_INSTANCE for the current REQUEST ZomeCall : \n', DNA_INSTANCE)
      // initate request
      return holochainZomeCall(
        DNA_INSTANCE,
        'transactions',
        'request',
        { from: counterparty,
          amount: txType[index].amount,
          notes: txType[index].notes,
          deadline: txType[index].deadline
        }
      )
    }
    case OFFER: {
      console.log('\n INVOKING OFFER CALL ****************************')
      console.log(' > DNA_INSTANCE for the current REQUEST ZomeCall : \n', DNA_INSTANCE)
      // initiate offer
      return holochainZomeCall(
        DNA_INSTANCE,
        'transactions',
        'promise',
        { to: counterparty,
          amount: txType[index].amount,
          notes: txType[index].notes,
          deadline: txType[index].deadline
        }
      )
    }
    case PAY: {
      console.log('\n INVOKING PAY CALL ****************************')
      console.log(' > DNA_INSTANCE for the current REQUEST ZomeCall : \n', DNA_INSTANCE)
      // offer in response to request
      return holochainZomeCall(
        DNA_INSTANCE,
        'transactions',
        'promise',
        {
          to: counterparty,
          amount: origininatingTx.amount,
          notes: 'Here is your Fuel!',
          deadline: origininatingTx.deadline,
          requestId: originId
        }
      )
    }
    case ACCEPT: {
      console.log('\n INVOKING ACCEPT CALL ****************************')
      console.log(' > DNA_INSTANCE for the current REQUEST ZomeCall : \n', DNA_INSTANCE)
      // accept offer
      return holochainZomeCall(
        DNA_INSTANCE,
        'transactions',
        'receive_payments_pending',
        {
          promises: originId
        }
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
