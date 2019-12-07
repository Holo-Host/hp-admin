import _ from 'lodash'
import { pickBy } from 'lodash/fp'
import { instanceCreateZomeCall } from '../holochainClient'
import { TYPE, STATUS, DIRECTION } from 'models/Transaction'
import { promiseMap } from 'utils'
import mockEarningsData from './mockEarningsData'

export const currentDataTimeIso = () => new Date().toISOString()
export const annulTransactionReaason = 'I need to revert the transaction.'

export const INSTANCE_ID = 'holofuel'
const createZomeCall = instanceCreateZomeCall(INSTANCE_ID)

const MOCK_DEADLINE = '4019-01-02T03:04:05.678901234+00:00'

// Creates an array of all counterparties for a provided transaction list
export async function getTxCounterparties (transactionList) {
  const counterpartyList = transactionList.map(({ counterparty }) => counterparty.id)
  const agentDetailsList = await promiseMap(counterpartyList, agentId => HoloFuelDnaInterface.user.getCounterparty({ agentId }))
  const noDuplicatesAgentList = _.uniqBy(agentDetailsList, 'id')
  return noDuplicatesAgentList
}

const presentRequest = ({ origin, event, stateDirection, eventTimestamp, counterpartyId, amount, notes, fees, status }) => {
  return {
    id: origin,
    amount: amount || event.Request.amount,
    counterparty: {
      id: counterpartyId || event.Request.from
    },
    direction: stateDirection,
    status: status || STATUS.pending,
    type: TYPE.request,
    timestamp: eventTimestamp,
    notes: notes || event.Request.notes,
    fees
  }
}

const presentOffer = ({ origin, event, stateDirection, eventTimestamp, counterpartyId, amount, notes, fees, status }) => {
  return {
    id: origin,
    amount: amount || event.Promise.tx.amount,
    counterparty: {
      id: counterpartyId || event.Promise.tx.to
    },
    direction: stateDirection,
    status: status || STATUS.pending,
    type: TYPE.offer,
    timestamp: eventTimestamp,
    notes: notes || event.Promise.tx.notes,
    fees
  }
}

const presentAcceptedPayment = async (acceptedPayment) => {
  const acceptedPaymentHash = acceptedPayment[1]
  if (acceptedPaymentHash.Err) throw new Error('There was an error accepting the payment for the referenced transaction. ERROR: ', acceptedPaymentHash.Err)

  const transactionId = acceptedPayment[0]
  const transaction = await HoloFuelDnaInterface.transactions.getPending(transactionId)

  return {
    ...transaction,
    id: transactionId,
    direction: DIRECTION.incoming, // this indicates the hf recipient
    status: STATUS.completed,
    type: TYPE.offer
  }
}

const presentReceipt = ({ origin, event, stateDirection, eventTimestamp, fees, presentBalance }) => {
  const counterpartyId = stateDirection === DIRECTION.incoming ? event.Receipt.cheque.invoice.promise.tx.from : event.Receipt.cheque.invoice.promise.tx.to
  return {
    id: origin,
    amount: event.Receipt.cheque.invoice.promise.tx.amount,
    counterparty: {
      id: counterpartyId
    },
    direction: stateDirection,
    status: STATUS.completed,
    type: event.Receipt.cheque.invoice.promise.request ? TYPE.request : TYPE.offer, // this indicates the original event type (eg. 'I requested hf from you', 'You sent a offer to me', etc.)
    timestamp: eventTimestamp,
    fees,
    presentBalance,
    notes: event.Receipt.cheque.invoice.promise.tx.notes
  }
}

// TODO: Review whether we should be showing this in addition to the receipt
const presentCheque = ({ origin, event, stateDirection, eventTimestamp, fees, presentBalance }) => {
  const counterpartyId = stateDirection === DIRECTION.incoming ? event.Cheque.invoice.promise.tx.from : event.Cheque.invoice.promise.tx.to
  return {
    id: origin,
    amount: event.Cheque.invoice.promise.tx.amount,
    counterparty: {
      id: counterpartyId
    },
    direction: stateDirection,
    status: STATUS.completed,
    type: event.Cheque.invoice.promise.request ? TYPE.request : TYPE.offer, // this indicates the original event type (eg. 'I requested hf from you', 'You sent a offer to me', etc.)
    timestamp: eventTimestamp,
    fees,
    presentBalance,
    notes: event.Cheque.invoice.promise.tx.notes
  }
}

function presentPendingRequest (transaction) {
  const { event, provenance } = transaction
  const origin = event[0]
  const stateDirection = DIRECTION.incoming // this indicates the recipient of funds
  const eventTimestamp = event[1]
  const counterpartyId = provenance[0]
  const { amount, notes, fee } = event[2].Request
  return presentRequest({ origin, event: event[2], stateDirection, eventTimestamp, counterpartyId, amount, notes, fees: fee })
}

function presentPendingOffer (transaction) {
  const { event, provenance } = transaction
  const origin = event[2].Promise.request ? event[2].Promise.request : event[0]
  const stateDirection = DIRECTION.outgoing // this indicates the spender of funds
  const eventTimestamp = event[1]
  const counterpartyId = provenance[0]
  const { amount, notes, fee } = event[2].Promise.tx
  return presentOffer({ origin, event: event[2], stateDirection, eventTimestamp, counterpartyId, amount, notes, fees: fee })
}

function presentTransaction (transaction) {
  const { state, origin, event, timestamp, adjustment, available } = transaction
  const stateStage = state.split('/')[1]
  const stateDirection = state.split('/')[0] // NOTE: This returns either 'incoming' or 'outgoing,' wherein, 'incoming' indicates the recipient of funds, 'outgoing' indicates the spender of funds.
  const parsedAdjustment = adjustment.Ok

  switch (stateStage) {
    case 'completed': {
      if (event.Receipt) return presentReceipt({ origin, event, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees, presentBalance: available })
      if (event.Cheque) return presentCheque({ origin, event, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees, presentBalance: available })
      throw new Error('Completed event did not have a Receipt or Cheque event')
    }
    // case 'transfered' {
    //   // This is a placeholder for when we implement syncrhonous transactions (and thus transfers)..
    // }

    // case 'declined': {
    //   // We have decided to show this **only** in the inbox page via the recent transactions filter
    //   if (event.Request) return presentRequest({ origin, event, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees, status: STATUS.rejected })
    //   if (event.Promise) return presentOffer({ origin, event, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees, status: STATUS.rejected })
    //   throw new Error('Rejected event did not have a Request or Promise event')
    // }

    case 'canceled': {
      console.log(' >>>>>>>>>> HERE IS A CANCELED transaction : ', event)
      if (event.entry.Request) return presentRequest({ origin, event, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees, status: STATUS.canceled })
      if (event.entry.Promise) return presentOffer({ origin, event, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees, status: STATUS.canceled })
      throw new Error('Canceled event did not have a Request or Promise event')
    }
    // NOTE:
    // The below two cases are 'waitingTransaction' cases.
    case 'requested': {
      return presentRequest({ origin, event, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees })
    }
    // 'approved' only indicates that a payment was offered (could be in response to a request or an isolate payment)
    case 'approved': {
      return presentOffer({ origin, event, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees })
    }
    default:
      throw new Error('Error: No transaction stateStage was matched. Current transaction stateStage : ', stateStage)
  }
}

const HoloFuelDnaInterface = {
  user: {
    get: async () => {
      const result = await createZomeCall('transactions/whoami')()
      if (result.Err) return console.error('There was an error locating the current holofuel agent nickname. ERROR: ', result.Err)
      return {
        id: result.agent_id.pub_sign_key,
        nickname: result.agent_id.nick
      }
    },
    getCounterparty: async ({ agentId }) => {
      const result = await createZomeCall('transactions/whois')({ agents: agentId })
      if (result.Err || !result[0].Ok) {
        console.error('There was an error locating the current holofuel agent nickname. ERROR: ', result.Err || result[0].Err)
        return {
          id: agentId,
          error: true
        }
      }

      return {
        id: result[0].Ok.agent_id.pub_sign_key,
        nickname: result[0].Ok.agent_id.nick
      }
    }
  },
  ledger: {
    get: async () => {
      const { balance, credit, payable, receivable, fees } = await createZomeCall('transactions/ledger_state')()
      return {
        balance,
        credit,
        payable,
        receivable,
        fees
      }
    }
  },
  transactions: {
    allCompleted: async () => {
      const { transactions } = await createZomeCall('transactions/list_transactions')()
      const listOfNonActionableTransactions = transactions.map(presentTransaction)
      const noDuplicateIds = _.uniqBy(listOfNonActionableTransactions, 'id')
      return noDuplicateIds.filter(tx => tx.status === 'completed').sort((a, b) => a.timestamp < b.timestamp ? -1 : 1)
    },
    allActionable: async () => {
      const { requests, promises } = await createZomeCall('transactions/list_pending')()
      const actionableTransactions = requests.map(presentPendingRequest).concat(promises.map(presentPendingOffer))

      console.log('ALL ACTIONABLE TRANSACTIONS : ', actionableTransactions.sort((a, b) => a.timestamp < b.timestamp ? -1 : 1))

      return actionableTransactions.sort((a, b) => a.timestamp < b.timestamp ? -1 : 1)
    },
    allWaiting: async () => {
      const { transactions } = await createZomeCall('transactions/list_transactions')()
      const listOfNonActionableTransactions = transactions.map(presentTransaction)
      // NOTE: Filtering out duplicate IDs should prevent an already completed tranaction from displaying as a pending tranaction if any lag occurs in data update layer.
      const noDuplicateIds = _.uniqBy(listOfNonActionableTransactions, 'id')
      return noDuplicateIds.filter(tx => tx.status === 'pending').sort((a, b) => a.timestamp < b.timestamp ? -1 : 1)
    },
    allEarnings: () => mockEarningsData,
    // NOTE: allNonPending will include Declined and Canceled Transactions:
    allNonPending: async () => {
      const { transactions } = await createZomeCall('transactions/list_transactions')()
      const listOfNonActionableTransactions = transactions.map(presentTransaction)
      const noDuplicateIds = _.uniqBy(listOfNonActionableTransactions, 'id')

      console.log('ALL NOT_PENDING TRANSACTIONS : ', noDuplicateIds.filter(tx => tx.status !== 'pending').sort((a, b) => a.timestamp < b.timestamp ? -1 : 1))

      return noDuplicateIds.filter(tx => tx.status !== 'pending').sort((a, b) => a.timestamp < b.timestamp ? -1 : 1)
    },
    getPending: async (transactionId) => {
      const { requests, promises } = await createZomeCall('transactions/list_pending')({ origins: transactionId })
      const transactionArray = requests.map(presentPendingRequest).concat(promises.map(presentPendingOffer))
      if (transactionArray.length === 0) {
        throw new Error(`no pending transaction with id ${transactionId} found.`)
      } else {
        return transactionArray[0]
      }
    },
    // NB: This is to allow handling of the other side of the transaction that was canceled... ( ?? - verify - ).
    getPendingCanceled: async (transactionId) => {
      const canceledResult = await createZomeCall('transactions/list_pending_canceled')({ origins: transactionId })
      console.log(' >>>>>>>>>> Pending Canceled transactions : ', canceledResult)

      const transactionArray = canceledResult.map(canceledTx => canceledTx.entry)
      if (transactionArray.length === 0) {
        throw new Error(`no pending transaction with id ${transactionId} found.`)
      } else {
        return transactionArray[0]
      }
    },
    // NB: This is to allow handling of the other side of the transaction that was declined.
    getPendingDeclined: async (transactionId) => {
      const declinedResult = await createZomeCall('transactions/list_pending_declined')({ origins: transactionId })
      console.log(' >>>>>>>>>> Pendng Declined transactions RESULT : ', declinedResult)

      const transactionArray = declinedResult.map(declinedTx => declinedTx.entry)
      if (transactionArray.length === 0) {
        throw new Error(`no pending transaction with id ${transactionId} found.`)
      } else {
        return transactionArray[0]
      }
    },
    // decline ACTIONABLE TRANSACTION (NB: pending transaction proposed by another agent) >> ONLY for asynchronous transactions.
    decline: async (transactionId) => {
      const transaction = await HoloFuelDnaInterface.transactions.getPending(transactionId)

      const reason = annulTransactionReaason
      const declinedProof = await createZomeCall('transactions/decline_pending')({ origins: transactionId, reason })

      console.log('declinedProof : ', declinedProof)

      return {
        ...transaction,
        id: transactionId,
        status: STATUS.declined,
        declinedReference: declinedProof
      }
    },
    // cancel WAITING TRANSACTION that current agent authored /OR ACTIONABLE TRANSACTION that agent received.
    cancel: async (transactionId) => {
      const transaction = await HoloFuelDnaInterface.transactions.getPending(transactionId)
      console.log('TRANSACTION TO CANCEL : ', transaction);
      
      const reason = annulTransactionReaason
      await createZomeCall('transactions/cancel_transactions')({ origins: transactionId, reason })
      return {
        ...transaction,
        id: transactionId,
        status: STATUS['pending-cancelation']
      }
    }
  },
  // complete PENDING CANCELED-TRANSACTION (ie: PENDING CANCELATION) - initated by counterparty
  complete_cancel: async (transactionId) => {
    const reason = annulTransactionReaason
    const transaction = await HoloFuelDnaInterface.transactions.getPendingCanceled(transactionId)
    const canceledProof = await createZomeCall('transactions/cancel')({ entry: transaction, reason })
    return {
      ...transaction,
      id: transactionId,
      status: STATUS.canceled,
      canceledReference: canceledProof
    }
  },
  requests: {
    create: async (counterpartyId, amount, notes) => {
      const origin = await createZomeCall('transactions/request')({ from: counterpartyId, amount: amount.toString(), deadline: MOCK_DEADLINE, notes })
      return {
        id: origin,
        amount,
        counterparty: {
          id: counterpartyId
        },
        direction: DIRECTION.incoming, // this indicates the hf recipient
        status: STATUS.pending,
        type: TYPE.request,
        timestamp: currentDataTimeIso
      }
    }
  },
  offers: {
    create: async (counterpartyId, amount, notes, requestId) => {
      const origin = await createZomeCall('transactions/promise')(pickBy(i => i, { to: counterpartyId, amount: amount.toString(), deadline: MOCK_DEADLINE, notes, requestId }))
      return {
        id: requestId || origin, // NOTE: If requestId isn't defined, then offer use origin as the ID (ie. Offer is the initiating transaction).
        amount,
        counterparty: {
          id: counterpartyId
        },
        direction: DIRECTION.outgoing, // this indicates the hf spender
        status: STATUS.pending,
        type: TYPE.offer,
        timestamp: currentDataTimeIso
      }
    },

    accept: async (transactionId) => {
      const transaction = await HoloFuelDnaInterface.transactions.getPending(transactionId)
      const result = await createZomeCall('transactions/receive_payments_pending')({ promises: transactionId })

      const acceptedPaymentHash = Object.entries(result)[0][1]
      if (acceptedPaymentHash.Err) throw new Error('There was an error accepting the payment for the referenced transaction. ERROR: ', acceptedPaymentHash.Err)

      return {
        ...transaction,
        id: transactionId, // should always match `Object.entries(result)[0][0]`
        direction: DIRECTION.incoming, // this indicates the hf recipient
        status: STATUS.completed,
        type: TYPE.offer
      }
    },

    acceptMany: async (transactionIdArray) => {
      const result = await createZomeCall('transactions/receive_payments_pending')({ promises: transactionIdArray })
      const transactionArray = Object.entries(result).map(presentAcceptedPayment)
      return transactionArray.sort((a, b) => a.timestamp < b.timestamp ? -1 : 1)
    },

    acceptAll: async () => {
      const result = await createZomeCall('transactions/receive_payments_pending')({})
      const transactionArray = Object.entries(result).map(presentAcceptedPayment)
      return transactionArray.sort((a, b) => a.timestamp < b.timestamp ? -1 : 1)
    }
  }
}

export default HoloFuelDnaInterface
