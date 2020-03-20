import _ from 'lodash'
import { pickBy } from 'lodash/fp'
import { instanceCreateZomeCall } from '../holochainClient'
import { TYPE, STATUS, DIRECTION } from 'models/Transaction'
import { promiseMap } from 'utils'
import mockEarningsData from './mockEarningsData'

export const currentDataTimeIso = () => new Date().toISOString()

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

const addFullCounterpartyToTx = async (tx) => {
  const fullCounterparty = await HoloFuelDnaInterface.user.getCounterparty({ agentId: tx.counterparty.id })
  return { ...tx, counterparty: fullCounterparty }
}

const getTxWithCounterparties = transactionList => promiseMap(transactionList, addFullCounterpartyToTx)

const presentRequest = ({ origin, event, stateDirection, eventTimestamp, counterpartyId, amount, notes, fees, status, isPayingARequest = false }) => {
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
    isPayingARequest
  }
}

const presentOffer = ({ origin, event, stateDirection, eventTimestamp, counterpartyId, amount, notes, fees, status, isPayingARequest = false }) => {
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
    isPayingARequest
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
  const transaction = declinedTx[2].Request ? presentPendingRequest({ event: declinedTx }, true) : presentPendingOffer({ event: declinedTx }, true)
  return {
    ...transaction,
    status: STATUS.declined
  }
}

const presentIncomingCanceledTransaction = canceledTx => {
  if (!canceledTx.event[2].Cancel.entry) throw new Error('The Canceled Transaction Entry (canceledTx.event[2].Cancel.entry) is UNDEFINED : ', canceledTx)
  let { event, provenance } = canceledTx
  event = [event[0], event[1], event[2].Cancel.entry]
  canceledTx = { ...canceledTx, event }
  const transaction = canceledTx.event[2].Request ? presentPendingRequest(canceledTx, true) : presentPendingOffer(canceledTx, true)

  return {
    ...transaction,
    status: STATUS.canceled,
    canceledBy: { id: provenance[0] }
  }
}

function presentPendingRequest (transaction, annuled = false) {
  const { event, provenance } = transaction
  const origin = event[0]
  const stateDirection = DIRECTION.outgoing // this indicates the recipient of funds. (Note: This is an actionable Tx.)
  const status = STATUS.pending
  const type = TYPE.request
  const eventTimestamp = event[1]
  const counterpartyId = annuled ? event[2].Request.from : provenance[0]
  const { amount, notes, fee } = event[2].Request
  return presentRequest({ origin, event: event[2], stateDirection, status, type, eventTimestamp, counterpartyId, amount, notes, fees: fee })
}

function presentPendingOffer (transaction, annuled = false) {
  const { event, provenance } = transaction
  const origin = event[0]
  const stateDirection = DIRECTION.incoming // this indicates the spender of funds. (Note: This is an actionable Tx.)
  const status = STATUS.pending
  const type = TYPE.offer
  const eventTimestamp = event[1]
  const counterpartyId = annuled ? event[2].Promise.tx.to : provenance[0]
  const { amount, notes, fee } = event[2].Promise.tx
  const isPayingARequest = !!event[2].Promise.request
  return presentOffer({ origin, event: event[2], stateDirection, status, type, eventTimestamp, counterpartyId, amount, notes, fees: fee, isPayingARequest })
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
      if (event.Cancel.entry.Request) return presentRequest({ origin, event: event.Cancel.entry, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees, status: STATUS.canceled })
      if (event.Cancel.entry.Promise) return presentOffer({ origin, event: event.Cancel.entry, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees, status: STATUS.canceled })
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
      const myProfile = await createZomeCall('profile/get_my_profile')()
      if (myProfile === 'Err') throw new Error('There was an error locating the current holofuel agent profile. ERROR: ', myProfile)
      return {
        id: myProfile.agent_address,
        avatarUrl: myProfile.avatar_url,
        nickname: myProfile.nickname
      }
    },
    getCounterparty: async ({ agentId }) => {
      const counterpartyProfileArray = await createZomeCall('profile/get_profile')({ agent_address: agentId })
      if (counterpartyProfileArray === 'Err' || !counterpartyProfileArray[0]) {
        return {
          id: agentId,
          avatarUrl: '',
          nickname: '',
          notFound: true
        }
      }
      return {
        id: counterpartyProfileArray[0].agent_address,
        avatarUrl: counterpartyProfileArray[0].avatar_url,
        nickname: counterpartyProfileArray[0].nickname
      }
    },
    update: async (id, nickname, avatarUrl) => {
      const params = avatarUrl ? { nickname, avatar_url: avatarUrl } : { nickname }
      const myProfile = await createZomeCall('profile/update_my_profile')(params)
      if (myProfile === 'Err') throw new Error('There was an error udpating the current holofuel agent profile. ERROR: ', myProfile)
      return {
        id: id,
        avatarUrl,
        nickname
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
    allCompleted: async (since) => {
      const params = since ? { since } : {}

      const { transactions } = await createZomeCall('transactions/list_transactions')(params)
      const nonActionableTransactions = transactions.map(presentTransaction)
      const noDuplicateIds = _.uniqBy(nonActionableTransactions, 'id')
      const presentedCompletedTransactions = await getTxWithCounterparties(noDuplicateIds.filter(tx => tx.status === 'completed'))
      return presentedCompletedTransactions.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)
    },
    allActionable: async () => {
      const { requests, promises, declined, canceled } = await createZomeCall('transactions/list_pending')()
      const actionableTransactions = await requests.map(r => presentPendingRequest(r)).concat(promises.map(p => presentPendingOffer(p))).concat(declined.map(presentDeclinedTransaction)).concat(canceled.map(presentIncomingCanceledTransaction))
      const presentedActionableTransactions = await getTxWithCounterparties(actionableTransactions)

      return presentedActionableTransactions.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)
    },
    allWaiting: async () => {
      const { transactions } = await createZomeCall('transactions/list_transactions')()
      const nonActionableTransactions = transactions.map(presentTransaction)
      /* NOTE: Filtering out duplicate IDs should prevent an already completed tranaction from displaying as a pending tranaction if any lag occurs in data update layer.  */
      const noDuplicateIdsWaitingList = _.uniqBy(nonActionableTransactions, 'id')
      const transactionIds = await HoloFuelDnaInterface.transactions.allDeclinedTransactions()
      // Filter out transactions that share a TX ID with a Declined or Cancelled Transaction
      const uniqueListWithOutDeclinedOrCanceled = _.differenceBy(noDuplicateIdsWaitingList, transactionIds, 'id')
      const presentedWaitingTransactions = await getTxWithCounterparties(uniqueListWithOutDeclinedOrCanceled.filter(tx => tx.status === 'pending'))

      return presentedWaitingTransactions.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)
    },
    allDeclinedTransactions: async () => {
      const declinedResult = await createZomeCall('transactions/list_pending_declined')()
      const transactionIds = declinedResult.map(presentDeclinedTransaction)

      return transactionIds
    },
    allEarnings: () => mockEarningsData,
    allNonActionableByState: async (transactionId, stateFilter = []) => {
      const { transactions } = await createZomeCall('transactions/list_transactions')({ state: stateFilter })
      const nonActionableTransactions = transactions.map(presentTransaction)
      const cleanedList = _.uniqBy(nonActionableTransactions, 'id')

      if (cleanedList.length === 0) {
        throw new Error(`No pending transaction with id ${transactionId} found.`)
      } else {
        return cleanedList
      }
    },
    /* NOTE: allNonPending will include Declined and Canceled Transactions:  */
    allNonPending: async () => {
      const { transactions } = await createZomeCall('transactions/list_transactions')()
      const nonActionableTransactions = transactions.map(presentTransaction)
      const noDuplicateIds = _.uniqBy(nonActionableTransactions, 'id')

      const myProfile = await HoloFuelDnaInterface.user.get()
      const whoami = myProfile.id

      const nonActionableTransactionsWithCancelByKey = noDuplicateIds
        .filter(tx => tx.status !== 'pending')
        .map(tx => tx.status === STATUS.canceled ? { ...tx, canceledBy: whoami } : { ...tx, canceledBy: null })

      const presentedNonActionableTransactions = await getTxWithCounterparties(nonActionableTransactionsWithCancelByKey)

      return presentedNonActionableTransactions.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)
    },
    getPending: async (transactionId) => {
      const { requests, promises } = await createZomeCall('transactions/list_pending')({ origins: transactionId })
      const transactionArray = requests.map(r => presentPendingRequest(r)).concat(promises.map(p => presentPendingOffer(p)))
      if (transactionArray.length === 0) {
        throw new Error(`no pending transaction with id ${transactionId} found.`)
      } else {
        return addFullCounterpartyToTx(transactionArray[0])
      }
    },
    /* NOTE: This is to allow handling of the other side of the transaction that was declined.  */
    getPendingDeclined: async (transactionId, { raw = false }) => {
      const declinedResult = await createZomeCall('transactions/list_pending_declined')({ origins: transactionId })
      const transactionArray = declinedResult.map(presentDeclinedTransaction)

      if (transactionArray.length === 0) {
        throw new Error(`no pending transaction with id ${transactionId} found.`)
      } else if (raw) {
        return {
          rawTransaction: declinedResult[0][2],
          transaction: transactionArray[0]
        }
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
        id: transactionId
      }
    },
    /* NOTE: cancel WAITING TRANSACTION that current agent authored. */
    cancel: async (transactionId) => {
      const authoredRequests = await HoloFuelDnaInterface.transactions.allNonActionableByState(transactionId, ['incoming/requested', 'outgoing/approved'])
      const transaction = authoredRequests.find(authoredRequest => authoredRequest.id === transactionId)
      const canceledProof = await createZomeCall('transactions/cancel_transactions')({ origins: transactionId })
      if (!canceledProof) throw new Error('Cancel Error.', canceledProof)

      return {
        ...transaction,
        id: transactionId
      }
    },
    /* NOTE: recover funds from DECLINED PENDING TRANSACTION (ie: Counterparty declined offer) - intended for REFUNDS  */
    recoverFunds: async (transactionId) => {
      // const TX_DECLINED = 'declined-transaction'
      const { rawTransaction, transaction } = await HoloFuelDnaInterface.transactions.getPendingDeclined(transactionId, { raw: true })
      const canceledProof = await createZomeCall('transactions/cancel')({ entry: rawTransaction })
      if (!canceledProof) {
        throw new Error(`Recover Funds Error.  Couldn'\t find a transaction with id ${transactionId}`)
      }

      return {
        ...transaction,
        id: transactionId,
        status: STATUS.canceled
      }
    },

    refundTransactions: async (transactions) => {
      const listOfTransactionIds = transactions.map(({ id }) => id)
      const canceledProof = await createZomeCall('transactions/cancel_transactions')({ origins: listOfTransactionIds })
      if (!canceledProof) {
        throw new Error(`Recover Funds Error.  Couldn'\t find a transactions with ids ${transactions}`)
      }

      const canceledDeclined = transactions.map(transaction => {
        return {
          ...transaction,
          status: STATUS.canceled
        }
      })

      return canceledDeclined
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
