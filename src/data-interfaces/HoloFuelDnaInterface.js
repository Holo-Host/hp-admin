import _, { isEmpty } from 'lodash'
import { omitBy, pickBy } from 'lodash/fp'
import { instanceCreateZomeCall } from 'holochainClient'
import { TYPE, STATUS, DIRECTION } from 'models/Transaction'
import { promiseMap } from 'utils'
import mockEarningsData from './mockEarningsData'

export const currentDataTimeIso = () => new Date().toISOString()

export const INSTANCE_ID = 'holofuel'
const createZomeCall = instanceCreateZomeCall(INSTANCE_ID)

const mockDeadline = () => {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString()
}

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
    isPayingARequest,
    isActioned: false
  }
}

const presentOffer = ({ origin, event, stateDirection, eventTimestamp, counterpartyId, amount, notes, fees, status, isPayingARequest = false, inProcess = false }) => {
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
    isPayingARequest,
    inProcess,
    isActioned: false
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
  const transaction = declinedTx[2].Request ? presentPendingRequest({ event: declinedTx }, true) : presentPendingOffer({ event: declinedTx }, [], true)
  return {
    ...transaction,
    status: STATUS.declined
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

function presentPendingOffer (transaction, invoicedOffers = [], annuled = false) {
  const invalidEvent = invoicedOffers.find(io => !io.Invoice)
  if (invalidEvent) return new Error(`Error: invalidEvent found: ${invalidEvent}.`)
  const hasInvoice = () => {
    const invoice = invoicedOffers.find(io => io.Invoice)
    if (invoice) return true
    else return false
  }
  const { event, provenance } = transaction
  const origin = event[0]
  const stateDirection = DIRECTION.incoming // this indicates the spender of funds. (Note: This is an actionable Tx.)
  const status = STATUS.pending
  const type = TYPE.offer
  const eventTimestamp = event[1]
  const counterpartyId = annuled ? event[2].Promise.tx.to : provenance[0]
  const { amount, notes, fee } = event[2].Promise.tx
  const isPayingARequest = !!event[2].Promise.request
  const inProcess = isEmpty(invoicedOffers) ? false : hasInvoice()
  return presentOffer({ origin, event: event[2], stateDirection, status, type, eventTimestamp, counterpartyId, amount, notes, fees: fee, isPayingARequest, inProcess })
}

let counter = 0
async function getListPending (params) {
  const { requests, promises, declined } = await createZomeCall('transactions/list_pending')(params)
  // The counter is a trigger for accepting any in-process offers (offers with an invoice)
  // currently, the decision is to check every 8 times when polling for list_pending is set to 30000ms (effectively being called every 4min)
  counter++
  if (counter === 8) {
    counter = 0
    promises.forEach(p => {
      if (!isEmpty(p[1])) {
        acceptInvoicedOffer(p[0], p[1])
      }
    })
  }
  return { requests, promises, declined }
}

const acceptInvoicedOffer = async (tx, invoicedOffers) => {
  const invoicedOffer = invoicedOffers.find(io => io.Invoice)
  if (invoicedOffer) {
    await HoloFuelDnaInterface.offers.accept(tx.event[0])
  }
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
      return new Error(`Completed event did not have a Receipt or Cheque event`)
    }

    case 'canceled': {
      if (event.Cancel.entry.Request) return presentRequest({ origin, event: event.Cancel.entry, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees, status: STATUS.canceled })
      if (event.Cancel.entry.Promise) return presentOffer({ origin, event: event.Cancel.entry, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees, status: STATUS.canceled })
      return new Error(`Canceled event did not have a Request or Promise event`)
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
    default: return new Error(`Error: No transaction stateStage was matched. Current transaction stateStage : ${stateStage}.`)
  }
}

// a hack while we clean up the apollo counterparties implementation
// AND create a more generalized data loading system
const cachedGetProfileCalls = {}

const cachedRecentlyActionedTransactions = []
const removeTransactionFromCache = transactionId => {
  _.remove(cachedRecentlyActionedTransactions, cachedRecentlyActionedTransactions.find(tx => tx.id === transactionId))
}

const HoloFuelDnaInterface = {
  user: {
    get: async () => {
      const { agent_address: id, avatar_url: avatarUrl, nickname, Err } = await createZomeCall('profile/get_my_profile')()
      if (Err) throw new Error(`There was an error locating your holofuel agent ID. ERROR: ${Err}.`)
      return {
        id,
        avatarUrl,
        nickname
      }
    },
    getCounterparty: async ({ agentId }) => {
      const presentCounterparty = counterparty => ({
        id: counterparty.agent_address,
        avatarUrl: counterparty.avatar_url,
        nickname: counterparty.nickname
      })

      if (cachedGetProfileCalls[agentId]) {
        if (typeof cachedGetProfileCalls[agentId].then === 'function') {
          return presentCounterparty(await cachedGetProfileCalls[agentId])
        } else {
          return cachedGetProfileCalls[agentId]
        }
      } else {
        cachedGetProfileCalls[agentId] = createZomeCall('profile/get_profile')({ agent_address: agentId })
        const counterparty = await cachedGetProfileCalls[agentId]
        if (!counterparty || counterparty.Err) {
          return {
            id: agentId,
            avatarUrl: null,
            nickname: null
          }
        }
        cachedGetProfileCalls[agentId] = presentCounterparty(counterparty)
        return presentCounterparty(counterparty)
      }
    },
    update: async (nickname, avatarUrl) => {
      const params = omitBy(param => param === undefined, { nickname, avatarUrl })
      const { agent_address: id, avatar_url: newAvatarUrl, nickname: newNickname, Err } = await createZomeCall('profile/update_my_profile')(params)
      if (Err) throw new Error(`There was an error udpating the current holofuel agent profile. ERROR: ${Err}. `)
      return {
        id,
        avatarUrl: newAvatarUrl,
        nickname: newNickname
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
      const nonActionableTransactions = transactions.map(presentTransaction).filter(tx => !(tx instanceof Error))
      const uniqueNonActionableTransactions = _.uniqBy(nonActionableTransactions, 'id')
      const presentedCompletedTransactions = await getTxWithCounterparties(uniqueNonActionableTransactions.filter(tx => tx.status === 'completed'))
      return presentedCompletedTransactions.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)
    },
    allActionable: async () => {
      const { requests, promises, declined } = await getListPending({})
      const actionableTransactions = requests.map(request => presentPendingRequest(request)).concat(promises.map(promise => presentPendingOffer(promise[0], promise[1]))).concat(declined.map(presentDeclinedTransaction)).filter(tx => !(tx instanceof Error))
      const actionableTransactionsDisplay = actionableTransactions.concat(cachedRecentlyActionedTransactions)
      const uniqActionableTransactions = _.uniqBy(actionableTransactionsDisplay, 'id')
      const presentedActionableTransactions = await getTxWithCounterparties(uniqActionableTransactions)

      return presentedActionableTransactions.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)
    },
    allWaiting: async () => {
      const { transactions } = await createZomeCall('transactions/list_transactions')()
      const nonActionableTransactions = transactions.map(presentTransaction).filter(tx => !(tx instanceof Error))
      /* NOTE: Filtering out duplicate IDs should prevent an already completed tranaction from displaying as a pending tranaction if any lag occurs in data update layer.  */
      const uniqueNonActionableTransactions = _.uniqBy(nonActionableTransactions, 'id')
      const declinedTransactions = await HoloFuelDnaInterface.transactions.allDeclinedTransactions()
      // Filter out transactions that share a TX ID with a Declined or Cancelled Transaction
      const uniqueListWithOutDeclinedOrCanceled = _.differenceBy(uniqueNonActionableTransactions, declinedTransactions, 'id')
      const presentedWaitingTransactions = await getTxWithCounterparties(uniqueListWithOutDeclinedOrCanceled.filter(tx => tx.status === 'pending'))

      return presentedWaitingTransactions.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)
    },
    allDeclinedTransactions: async () => {
      const declinedTransactions = await createZomeCall('transactions/list_pending_declined')()
      const presentedDeclinedTransactions = declinedTransactions.map(presentDeclinedTransaction)
      const uniqueDeclinedTransactions = _.uniqBy(presentedDeclinedTransactions, 'id')

      return uniqueDeclinedTransactions
    },
    allEarnings: () => mockEarningsData,
    allNonActionableByState: async (transactionId, stateFilter = []) => {
      const { transactions } = await createZomeCall('transactions/list_transactions')({ state: stateFilter })
      const nonActionableTransactions = transactions.map(presentTransaction).filter(tx => !(tx instanceof Error))
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
      const nonActionableTransactions = transactions.map(presentTransaction).filter(tx => !(tx instanceof Error))
      const uniqueNonActionableTransactions = _.uniqBy(nonActionableTransactions, 'id')

      const myProfile = await HoloFuelDnaInterface.user.get()

      const nonActionableTransactionsWithCancelByKey = uniqueNonActionableTransactions
        .filter(tx => tx.status !== 'pending')
        .map(tx => tx.status === STATUS.canceled ? { ...tx, canceledBy: myProfile } : { ...tx, canceledBy: null })

      const presentedNonActionableTransactions = await getTxWithCounterparties(nonActionableTransactionsWithCancelByKey)

      return presentedNonActionableTransactions.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)
    },
    getPending: async (transactionId) => {
      const { requests, promises } = await getListPending({ origins: transactionId })
      const transactions = requests.map(r => presentPendingRequest(r)).concat(promises.map(p => presentPendingOffer(p[0], p[1]))).filter(tx => !(tx instanceof Error))
      if (transactions.length === 0) {
        throw new Error(`No pending transaction with id ${transactionId} found.`)
      } else {
        return addFullCounterpartyToTx(transactions[0])
      }
    },
    /* NOTE: This is to allow handling of the other side of the transaction that was declined.  */
    getPendingDeclined: async (transactionId, { raw = false }) => {
      const declinedTransactions = await createZomeCall('transactions/list_pending_declined')({ origins: transactionId })

      if (declinedTransactions.length === 0) {
        throw new Error(`No pending transaction with id ${transactionId} found.`)
      } else if (raw) {
        return {
          rawTransaction: declinedTransactions[0][2],
          transaction: presentDeclinedTransaction(declinedTransactions[0])
        }
      } else {
        return presentDeclinedTransaction(declinedTransactions[0])
      }
    },
    /* NOTE: decline ACTIONABLE TRANSACTION (NB: pending transaction proposed by another agent) >> ONLY for on asynchronous transactions. */
    decline: async (transactionId) => {
      const transaction = await HoloFuelDnaInterface.transactions.getPending(transactionId)
      const declinedProof = await createZomeCall('transactions/decline_pending')({ origins: transactionId })
      if (!declinedProof) throw new Error(`Decline Error: ${declinedProof}.`)

      const presentedTransaction = {
        ...transaction,
        id: transactionId,
        isActioned: true
      }

      cachedRecentlyActionedTransactions.push(presentedTransaction)
      setTimeout(() => {
        removeTransactionFromCache(presentedTransaction.id)
      }, 5000)
      return presentedTransaction
    },
    /* NOTE: cancel WAITING TRANSACTION that current agent authored. */
    cancel: async (transactionId) => {
      const authoredRequests = await HoloFuelDnaInterface.transactions.allNonActionableByState(transactionId, ['incoming/requested', 'outgoing/approved'])
      const transaction = authoredRequests.find(authoredRequest => authoredRequest.id === transactionId)
      const canceledProof = await createZomeCall('transactions/cancel_transactions')({ origins: transactionId })
      if (!canceledProof) throw new Error(`Cancel Error: ${canceledProof}.`)

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
        throw new Error(`Recover Funds Error.  Couldn'\t find a transaction with id ${transactionId}.`)
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
        throw new Error(`Recover Funds Error.  Couldn'\t find a transactions with ids ${transactions}.`)
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
      const origin = await createZomeCall('transactions/request')({ from: counterpartyId, amount: amount.toString(), deadline: mockDeadline(), notes })
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
      const origin = await createZomeCall('transactions/promise')(pickBy(i => i, { to: counterpartyId, amount: amount.toString(), deadline: mockDeadline(), notes, request: requestId }))

      const presentedTransaction = {
        id: requestId || origin, // NB: If requestId isn't defined, then offer uses origin as the ID (ie. Offer is the initiating transaction).
        amount,
        counterparty: {
          id: counterpartyId
        },
        notes,
        direction: DIRECTION.outgoing, // this indicates the hf spender
        status: STATUS.pending,
        type: requestId ? TYPE.request : TYPE.offer, // NB: If requestId isn't defined, then base transaction is an offer, otherwise, it's a request user is paying
        isActioned: !!requestId, // NB: If requestId isn't defined, then offer was initiated, otherwise, a response to a payment has been actioned
        timestamp: currentDataTimeIso
      }

      if (requestId) {
        cachedRecentlyActionedTransactions.push(presentedTransaction)
        setTimeout(() => {
          removeTransactionFromCache(presentedTransaction.id)
        }, 5000)
      }
      return presentedTransaction
    },

    accept: async (transactionId) => {
      const transaction = await HoloFuelDnaInterface.transactions.getPending(transactionId)
      const result = await createZomeCall('transactions/receive_payments_pending')({ promises: transactionId })
      const acceptedPaymentHash = Object.entries(result)[0][1]
      if (acceptedPaymentHash.Err) {
        if (acceptedPaymentHash.Err.Internal) {
          const spenderValidationError = /(Spender chain invalid)/g
          if (typeof acceptedPaymentHash.Err.Internal === 'string' && spenderValidationError.test(acceptedPaymentHash.Err.Internal)) {
            return {
              ...transaction,
              id: transactionId, // should always match `Object.entries(result)[0][0]`
              direction: DIRECTION.incoming, // this indicates the hf recipient
              status: STATUS.pending,
              type: TYPE.offer,
              isActioned: false,
              inProcess: false,
              isStale: true
            }
          } else {
            try {
              if (JSON.parse(acceptedPaymentHash.Err.Internal).kind.Timeout) {
                return {
                  ...transaction,
                  id: transactionId, // should always match `Object.entries(result)[0][0]`
                  direction: DIRECTION.incoming, // this indicates the hf recipient
                  status: STATUS.pending,
                  type: TYPE.offer,
                  isActioned: true,
                  inProcess: true,
                  isStale: false
                }
              }
            } catch (e) {
              throw new Error(acceptedPaymentHash.Err)
            }
            // default:
            throw new Error(acceptedPaymentHash.Err)
          }
        }
      }

      const presentedTransaction = {
        ...transaction,
        id: transactionId, // should always match `Object.entries(result)[0][0]`
        direction: DIRECTION.incoming, // this indicates the hf recipient
        status: STATUS.completed,
        type: TYPE.offer,
        isActioned: true,
        inProcess: false,
        isStale: false
      }

      cachedRecentlyActionedTransactions.push(presentedTransaction)
      setTimeout(() => {
        removeTransactionFromCache(presentedTransaction.id)
      }, 5000)
      return presentedTransaction
    }
  }
}

export default HoloFuelDnaInterface
