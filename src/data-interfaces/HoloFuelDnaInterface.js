import _ from 'lodash'
import { mapValues, pickBy } from 'lodash/fp'
import { instanceCreateZomeCall } from '../holochainClient'
import { TYPE, STATUS, DIRECTION } from 'models/Transaction'

export const currentDataTimeIso = () => new Date().toISOString()

export const INSTANCE_ID = 'holofuel'
const createZomeCall = instanceCreateZomeCall(INSTANCE_ID)

const MOCK_DEADLINE = '4019-01-02T03:04:05.678901234+00:00'

const presentRequest = ({ origin, event, stateDirection, eventTimestamp, counterparty, amount, notes, fees }) => {
  return {
    id: origin,
    amount: amount || event.Request.amount,
    counterparty: counterparty || event.Request.from,
    direction: stateDirection,
    status: STATUS.pending,
    type: TYPE.request,
    timestamp: eventTimestamp,
    notes: notes || event.Request.notes,
    fees
  }
}

const presentOffer = ({ origin, event, stateDirection, eventTimestamp, counterparty, amount, notes, fees }) => {
  return {
    id: origin,
    amount: amount || event.Promise.tx.amount,
    counterparty: counterparty || event.Promise.tx.to,
    direction: stateDirection,
    status: STATUS.pending,
    type: TYPE.offer,
    timestamp: eventTimestamp,
    notes: notes || event.Promise.tx.notes,
    fees
  }
}

const presentReceipt = ({ origin, event, stateDirection, eventTimestamp, fees, presentBalance }) => {
  const counterparty = stateDirection === DIRECTION.incoming ? event.Receipt.cheque.invoice.promise.tx.from : event.Receipt.cheque.invoice.promise.tx.to
  return {
    id: origin,
    amount: event.Receipt.cheque.invoice.promise.tx.amount,
    counterparty,
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
  const counterparty = stateDirection === DIRECTION.incoming ? event.Cheque.invoice.promise.tx.from : event.Cheque.invoice.promise.tx.to
  return {
    id: origin,
    amount: event.Cheque.invoice.promise.tx.amount,
    counterparty,
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
  const counterparty = provenance[0]
  const { amount, notes, fee } = event[2].Request
  return presentRequest({ origin, event: event[2], stateDirection, eventTimestamp, counterparty, amount, notes, fees: fee })
}

function presentPendingOffer (transaction) {
  const { event, provenance } = transaction
  const origin = event[2].Promise.request ? event[2].Promise.request : event[0]
  const stateDirection = DIRECTION.outgoing // this indicates the spender of funds
  const eventTimestamp = event[1]
  const counterparty = provenance[0]
  const { amount, notes, fee } = event[2].Promise.tx
  return presentOffer({ origin, event: event[2], stateDirection, eventTimestamp, counterparty, amount, notes, fees: fee })
}

function presentTransaction (transaction) {
  const { state, origin, event, timestamp, adjustment } = transaction
  const stateStage = state.split('/')[1]
  const stateDirection = state.split('/')[0] // NOTE: This returns either 'incoming' or 'outgoing,' wherein, 'incoming' indicates the recipient of funds, 'outgoing' indicates the spender of funds.
  // NOTE: *Holofuel does NOT yet provide a balance that represents the 'RESULTING ACCT BALANCE after this transaction adjustment', instead of the only the tx adjustment balance or real-time balance.*
  const parsedAdjustment = mapValues('Ok', adjustment)

  switch (stateStage) {
    case 'completed': {
      if (event.Receipt) return presentReceipt({ origin, event, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees, presentBalance: parsedAdjustment.resulting_balance })
      if (event.Cheque) return presentCheque({ origin, event, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees, presentBalance: parsedAdjustment.resulting_balance })
      throw new Error('Completed event did not have a Receipt or Cheque event')
    }
    case 'rejected': {
      // We have decided not to return the reject case into the Ledger
      break
    }
    // The below two cases are 'waitingTransaction' cases :
    case 'requested': {
      return presentRequest({ origin, event, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees })
    }
    // NOTE: 'approved' only indicates that a payment was offered (could be in response to a request or an isolate payment)
    case 'approved': {
      return presentOffer({ origin, event, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees })
    }
    default:
      throw new Error('Error: No transaction stateState was matched. Current transaction stateStage : ', stateStage)
  }
}

const HoloFuelDnaInterface = {
  user: {
    get: async () => {
      const result = await createZomeCall('transactions/whoami')()
      if (result.error) throw new Error('There was an error locating the current holofuel agent nickname. ERROR: ', result.error)
      return {
        id: result.pub_sign_key,
        nickname: result.nick
      }
    },
    getCounterparty: async ({ agentId }) => {
      const result = await createZomeCall('transactions/whoami')({ agentId })
      if (result.error) throw new Error('There was an error locating the counterparty agent nickname. ERROR: ', result.error)

      return {
        id: result.pub_sign_key,
        nickname: result.nick
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
      return actionableTransactions.sort((a, b) => a.timestamp < b.timestamp ? -1 : 1)
    },
    allWaiting: async () => {
      const { transactions } = await createZomeCall('transactions/list_transactions')()
      const listOfNonActionableTransactions = transactions.map(presentTransaction)
      // NOTE: Filtering out duplicate IDs should prevent an already completed tranaction from displaying as a pending tranaction if any lag occurs in data update layer.
      const noDuplicateIds = _.uniqBy(listOfNonActionableTransactions, 'id')
      return noDuplicateIds.filter(tx => tx.status === 'pending').sort((a, b) => a.timestamp < b.timestamp ? -1 : 1)
    },
    getPending: async transactionId => {
      const { requests, promises } = await createZomeCall('transactions/list_pending')({ origins: transactionId })
      const transactionArray = requests.map(presentPendingRequest).concat(promises.map(presentPendingOffer))
      if (transactionArray.length === 0) {
        throw new Error(`no pending transaction with id ${transactionId} found.`)
      } else {
        return transactionArray[0]
      }
    },
    // decline pending proposed transaction (NB: proposed by another agent).
    decline: async transactionId => {
      const transaction = await HoloFuelDnaInterface.transactions.getPending(transactionId)
      await createZomeCall('transactions/decline')({ origin: transactionId })
      return {
        ...transaction,
        id: transactionId,
        status: STATUS.rejected
      }
    },
    // cancel pending authored transaction.
    cancel: async transactionId => {
      const transaction = await HoloFuelDnaInterface.transactions.getPending(transactionId)
      await createZomeCall('transactions/cancel')({ origin: transactionId })
      return {
        ...transaction,
        id: transactionId,
        status: STATUS.cancelled
      }
    }
  },
  requests: {
    create: async (counterparty, amount, notes) => {
      const origin = await createZomeCall('transactions/request')({ from: counterparty, amount: amount.toString(), deadline: MOCK_DEADLINE, notes })
      return {
        id: origin,
        amount,
        counterparty,
        direction: DIRECTION.incoming, // this indicates the hf recipient
        status: STATUS.pending,
        type: TYPE.request,
        timestamp: currentDataTimeIso
      }
    }
  },
  offers: {
    create: async (counterparty, amount, notes, requestId) => {
      const origin = await createZomeCall('transactions/promise')(pickBy(i => i, { to: counterparty, amount: amount.toString(), deadline: MOCK_DEADLINE, notes, requestId }))
      return {
        id: requestId || origin, // NOTE: If requestId isn't defined, then offer use origin as the ID (ie. Offer is the initiating transaction).
        amount,
        counterparty,
        direction: DIRECTION.outgoing, // this indicates the hf spender
        status: STATUS.pending,
        type: TYPE.offer,
        timestamp: currentDataTimeIso
      }
    },

    accept: async (transactionId) => {
      const transaction = await HoloFuelDnaInterface.transactions.getPending(transactionId)
      await createZomeCall('transactions/receive_payments_pending')({ promises: transactionId })
      return {
        ...transaction,
        id: transactionId,
        direction: DIRECTION.incoming, // this indicates the hf recipient
        status: STATUS.completed,
        type: TYPE.offer
      }
    }
  }
}

export default HoloFuelDnaInterface
