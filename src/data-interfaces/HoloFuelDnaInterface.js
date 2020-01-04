import _ from 'lodash'
import { pickBy } from 'lodash/fp'
import { instanceCreateZomeCall } from '../holochainClient'
import { TYPE, STATUS, DIRECTION } from 'models/Transaction'
import { promiseMap } from 'utils'
import mockEarningsData from './mockEarningsData'

export const currentDataTimeIso = () => new Date().toISOString()
export const annulTransactionReason = 'I need to revert the transaction.'

export const INSTANCE_ID = 'holofuel'
const createZomeCall = instanceCreateZomeCall(INSTANCE_ID)

const MOCK_DEADLINE = '4019-01-02T03:04:05.678901234+00:00'

/* Creates an array of all counterparties for a provided transaction list */
export async function getTxCounterparties (transactionList) {
  const counterpartyList = transactionList.map(({ counterparty }) => counterparty.id)
  const agentDetailsList = await promiseMap(counterpartyList, agentId => HoloFuelDnaInterface.user.getCounterparty({ agentId }))
  const noDuplicatesAgentList = _.uniqBy(agentDetailsList, 'id')
  return noDuplicatesAgentList
}

const presentRequest = ({ origin, event, stateDirection, eventTimestamp, counterpartyId, amount, notes, fees, status, reason }) => {
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
    fees,
    reason
  }
}

const presentOffer = ({ origin, event, stateDirection, eventTimestamp, counterpartyId, amount, notes, fees, status, reason }) => {
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
    fees,
    reason
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
    type: stateDirection === DIRECTION.outgoing ? TYPE.request : TYPE.offer, // this indicates the original event type (eg. 'I requested hf from you', 'You sent a offer to me', etc.)
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

const presentDeclinedTransaction = declinedTx => {
  if (!declinedTx[2]) throw new Error('The Declined Transaction Entry(declinedTx[2]) is UNDEFINED : ', declinedTx)
  const transaction = declinedTx[2].Request ? presentPendingRequest(declinedTx, true) : presentPendingOffer(declinedTx, true)
  return {
    ...transaction,
    status: STATUS.declined
  }
}

const presentCanceledTransaction = canceledTx => {
  if (!canceledTx.event[2].Cancel.entry) throw new Error('The Canceled Transaction Entry (canceledTx.event[2].Cancel.entry) is UNDEFINED : ', canceledTx)
  let { event } = canceledTx
  event = [event[0], event[1], event[2].Cancel.entry]
  canceledTx = { ...canceledTx, event }
  const transaction = !canceledTx.event[2].Cancel.entry.Request ? presentPendingRequest(canceledTx, false) : presentPendingOffer(canceledTx, false)
  return {
    ...transaction,
    status: STATUS.canceled
  }
}

function presentPendingRequest (transaction, declined = false) {
  let { event, provenance } = transaction
  if (declined) event = transaction
  const origin = event[0]
  const stateDirection = DIRECTION.outgoing // this indicates the recipient of funds. (Note: This is an actionable Tx.)
  const status = STATUS.pending
  const type = TYPE.request
  const eventTimestamp = event[1]
  const counterpartyId = declined ? event[2].Request.from : provenance[0]
  const { amount, notes, fee } = event[2].Request
  return presentRequest({ origin, event: event[2], stateDirection, status, type, eventTimestamp, counterpartyId, amount, notes, fees: fee })
}

function presentPendingOffer (transaction, declined = false) {
  let { event, provenance } = transaction
  if (declined) event = transaction
  const origin = event[0]
  const stateDirection = DIRECTION.incoming // this indicates the spender of funds. (Note: This is an actionable Tx.)
  const status = STATUS.pending
  const type = TYPE.offer
  const eventTimestamp = event[1]
  const counterpartyId = declined ? event[2].Promise.tx.to : provenance[0]
  const { amount, notes, fee } = event[2].Promise.tx
  return presentOffer({ origin, event: event[2], stateDirection, status, type, eventTimestamp, counterpartyId, amount, notes, fees: fee })
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

    case 'canceled': {
      if (event.Cancel.entry.Request) return presentRequest({ origin, event: event.Cancel.entry, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees, status: STATUS.canceled, reason: event.Cancel.reason })
      if (event.Cancel.entry.Promise) return presentOffer({ origin, event: event.Cancel.entry, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees, status: STATUS.canceled, reason: event.Cancel.reason })
      throw new Error('Canceled event did not have a Request or Promise event')
    }
    /* **************************  NOTE: ********************************** */
    /* The below two cases are 'waitingTransaction' cases. */
    case 'requested': {
      return presentRequest({ origin, event, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees })
    }
    /* 'approved' only indicates that a payment was offered (could be in response to a request or an isolate payment) */
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
      if (result.Err) throw new Error('There was an error locating the current holofuel agent nickname. ERROR: ', result.Err)

      return {
        id: result.agent_id.pub_sign_key,
        nickname: result.agent_id.nick
      }
    },
    getCounterparty: async ({ agentId }) => {
      const result = await createZomeCall('transactions/whois')({ agents: agentId })
      if (result.Err || !result[0].Ok) {
        return {
          id: agentId,
          notFound: true
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

      return noDuplicateIds.filter(tx => tx.status === 'completed').sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)
    },
    allActionable: async () => {
      const { requests, promises, declined, canceled } = await createZomeCall('transactions/list_pending')()
      const actionableTransactions = await requests.map(r => presentPendingRequest(r)).concat(promises.map(p => presentPendingOffer(p))).concat(declined.map(presentDeclinedTransaction)).concat(canceled.map(presentCanceledTransaction))

      return actionableTransactions.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)
    },
    allWaiting: async () => {
      const { transactions } = await createZomeCall('transactions/list_transactions')()
      const listOfNonActionableTransactions = transactions.map(presentTransaction)
      /* NOTE: Filtering out duplicate IDs should prevent an already completed tranaction from displaying as a pending tranaction if any lag occurs in data update layer.  */
      const noDuplicateIdsWaitingList = _.uniqBy(listOfNonActionableTransactions, 'id')
      const listOfDeclinedTransactions = await HoloFuelDnaInterface.transactions.allDeclinedTransactions()
      // Filter out transactions that share a TX ID with a Declined Transaction (FYI: pending declined txs (on the counterparty side?) will also result from a canceled tx..)
      const uniqueListWithOutDeclinedOrCanceled = _.differenceBy(noDuplicateIdsWaitingList, listOfDeclinedTransactions, 'id')

      return uniqueListWithOutDeclinedOrCanceled.filter(tx => tx.status === 'pending').sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)
    },
    allDeclinedTransactions: async () => {
      const declinedResult = await createZomeCall('transactions/list_pending_declined')()
      const listOfDeclinedTransactions = declinedResult.map(presentDeclinedTransaction)

      return listOfDeclinedTransactions
    },
    allEarnings: () => mockEarningsData,
    allNonActionableByState: async (transactionId, stateFilter = []) => {
      const { transactions } = await createZomeCall('transactions/list_transactions')({ state: stateFilter })
      const listOfNonActionableTransactions = transactions.map(presentTransaction)
      const cleanedList = _.uniqBy(listOfNonActionableTransactions, 'id')

      if (cleanedList.length === 0) {
        console.error(`No pending transaction with id ${transactionId} found.`)
      } else {
        return cleanedList
      }
    },
    /* NOTE: allNonPending will include Declined and Canceled Transactions:  */
    allNonPending: async () => {
      const { transactions } = await createZomeCall('transactions/list_transactions')()
      const listOfNonActionableTransactions = transactions.map(presentTransaction)
      const noDuplicateIds = _.uniqBy(listOfNonActionableTransactions, 'id')

      return noDuplicateIds.filter(tx => tx.status !== 'pending').sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)
    },
    getPending: async (transactionId) => {
      const { requests, promises } = await createZomeCall('transactions/list_pending')({ origins: transactionId })
      const transactionArray = requests.map(r => presentPendingRequest(r)).concat(promises.map(p => presentPendingOffer(p)))
      if (transactionArray.length === 0) {
        throw new Error(`no pending transaction with id ${transactionId} found.`)
      } else {
        return transactionArray[0]
      }
    },
    /* NOTE: This is to allow handling of the other side of the transaction that was declined.  */
    getPendingDeclined: async (transactionId, { raw = false }) => {
      const declinedResult = await createZomeCall('transactions/list_pending_declined')({ origins: transactionId })
      const transactionArray = declinedResult.map(presentDeclinedTransaction)

      if (transactionArray.length === 0) {
        throw new Error(`no pending transaction with id ${transactionId} found.`)
      } else if (raw) {
        return declinedResult[0][2]
      } else {
        return transactionArray[0]
      }
    },
    /* NOTE: decline ACTIONABLE TRANSACTION (NB: pending transaction proposed by another agent) >> ONLY for on asynchronous transactions. */
    decline: async (transactionId) => {
      const transaction = await HoloFuelDnaInterface.transactions.getPending(transactionId)
      const declinedProof = await createZomeCall('transactions/decline_pending')({ origins: transactionId })
      if (!declinedProof) throw new Error('Decline Error.', declinedProof)
      return {
        ...transaction,
        id: transactionId,
        status: STATUS.declined
      }
    },
    /* NOTE: cancel WAITING TRANSACTION that current agent authored. */
    cancel: async (transactionId) => {
      const authoredRequests = await HoloFuelDnaInterface.transactions.allNonActionableByState(transactionId, ['incoming/requested', 'outgoing/approved'])
      const transaction = authoredRequests.find(authoredRequest => authoredRequest.id === transactionId)
      const reason = annulTransactionReason
      const canceledProof = await createZomeCall('transactions/cancel_transactions')({ origins: transactionId, reason })
      if (!canceledProof) throw new Error('Decline Error.', canceledProof)

      return {
        ...transaction,
        id: transactionId,
        status: STATUS.canceled
      }
    },
    /* NOTE: recover funds from DECLINED PENDING TRANSACTION (ie: Counterparty declined offer) - intended for REFUNDS  */
    recoverFunds: async (transactionId) => {
      // const reason = annulTransactionReason
      const transaction = await HoloFuelDnaInterface.transactions.getPendingDeclined(transactionId, { raw: true })
      console.log('transaction', transaction)

      const canceledProof = await createZomeCall('transactions/cancel')({ entry: transaction })
      return {
        ...transaction,
        id: transactionId,
        status: STATUS.canceled,
        canceledReference: canceledProof
      }
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
        notes,
        direction: DIRECTION.incoming, // this indicates the hf recipient
        status: STATUS.pending,
        type: TYPE.request,
        timestamp: currentDataTimeIso
      }
    }
  },
  offers: {
    create: async (counterpartyId, amount, notes, requestId) => {
      const origin = await createZomeCall('transactions/promise')(pickBy(i => i, { to: counterpartyId, amount: amount.toString(), deadline: MOCK_DEADLINE, notes, request: requestId }))

      return {
        id: requestId || origin, // NB: If requestId isn't defined, then offer use origin as the ID (ie. Offer is the initiating transaction).
        amount,
        counterparty: {
          id: counterpartyId
        },
        notes,
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
      return transactionArray.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)
    },

    acceptAll: async () => {
      const result = await createZomeCall('transactions/receive_payments_pending')({})
      const transactionArray = Object.entries(result).map(presentAcceptedPayment)
      return transactionArray.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)
    }
  }
}

export default HoloFuelDnaInterface
