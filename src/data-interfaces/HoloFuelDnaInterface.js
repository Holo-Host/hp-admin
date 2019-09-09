import _ from 'lodash'
import { instanceCreateZomeCall } from '../holochainClient'
import { TYPE, STATUS, DIRECTION } from 'models/Transaction'

export const currentDataTimeIso = () => new Date().toISOString()

export const INSTANCE_ID = 'holofuel'
const createZomeCall = instanceCreateZomeCall(INSTANCE_ID)

const MOCK_DEADLINE = '4019-01-02T03:04:05.678901234+00:00'

const presentOffer = ({ origin, event, stateDirection, eventTimestamp, counterparty, amount }) => {
  return {
    id: origin,
    amount: amount || event.Promise.tx.amount,
    counterparty: counterparty || event.Promise.tx.to,
    direction: stateDirection,
    status: STATUS.pending,
    type: TYPE.offer,
    timestamp: eventTimestamp
  }
}

const presentRequest = ({ origin, event, stateDirection, eventTimestamp, counterparty, amount }) => {
  return {
    id: origin,
    amount: amount || event.Request.amount,
    counterparty: counterparty || event.Request.from,
    direction: stateDirection,
    status: STATUS.pending,
    type: TYPE.request,
    timestamp: eventTimestamp
  }
}

const presentReceipt = ({ origin, event, stateDirection, eventTimestamp, fees, presentBalance }) => {
  const counterparty = stateDirection === DIRECTION.incoming ? event.Receipt.cheque.invoice.promise.tx.from : event.Receipt.cheque.invoice.promise.tx.to
  return {
    id: origin,
    amount: event.Receipt.cheque.invoice.promise.tx.amount,
    counterparty,
    direction: stateDirection,
    status: STATUS.complete,
    type: event.Receipt.cheque.invoice.promise.request ? TYPE.request : TYPE.offer, // this indicates the original event type (eg. 'I requested hf from you', 'You sent a offer to me', etc.)
    timestamp: eventTimestamp,
    fees,
    presentBalance
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
    status: STATUS.complete,
    type: event.Cheque.invoice.promise.request ? TYPE.request : TYPE.offer, // this indicates the original event type (eg. 'I requested hf from you', 'You sent a offer to me', etc.)
    timestamp: eventTimestamp,
    fees,
    presentBalance
  }
}

function presentPendingRequest (transaction) {
  const { event, provenance } = transaction
  const origin = event[0]
  const stateDirection = DIRECTION.incoming // this indicates the recipient of funds
  const eventTimestamp = event[1]
  const counterparty = provenance[0]
  const amount = event[2].Request.amount
  return presentRequest({ origin, stateDirection, eventTimestamp, counterparty, amount })
}

function presentPendingOffer (transaction) {
  const { event, provenance } = transaction
  const origin = event[2].Promise.request ? event[2].Promise.request : event[0]
  const stateDirection = DIRECTION.outgoing // this indicates the spender of funds
  const eventTimestamp = event[1]
  const counterparty = provenance[0]
  const amount = event[2].Promise.tx.amount
  return presentOffer({ origin, stateDirection, eventTimestamp, counterparty, amount })
}

function presentTransaction (transaction) {
  const { state, origin, event, timestamp, adjustment } = transaction
  const stateStage = state.split('/')[1]
  const stateDirection = state.split('/')[0] // NOTE: This returns either 'incoming' or 'outgoing,' wherein, 'incoming' indicates the recipient of funds, 'outgoing' indicates the spender of funds.
  switch (stateStage) {
    case 'completed': {
      if (event.Receipt) return presentReceipt({ origin, event, stateDirection, eventTimestamp: timestamp.event, fees: adjustment.fees, presentBalance: adjustment.balance })
      if (event.Cheque) return presentCheque({ origin, event, stateDirection, eventTimestamp: timestamp.event, fees: adjustment.fees, presentBalance: adjustment.balance })
      throw new Error('Completed event did not have a Receipt or Cheque event')
    }
    case 'rejected': {
      // We have decided not to return the reject case into the Ledger
      break
    }
    // The below two cases are 'waitingTransaction' cases :
    case 'requested': {
      return presentRequest({ origin, event, stateDirection, timestamp: timestamp.event })
    }
    // NOTE: 'approved' only indicates that a payment was offered (could be in response to a request or an isolate payment)
    case 'approved': {
      return presentOffer({ origin, event, stateDirection, timestamp: timestamp.event })
    }
    default:
      throw new Error('Error: No transaction stateState was matched. Current transaction stateStage : ', stateStage)
  }
}

const HoloFuelDnaInterface = {
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
    allComplete: async () => {
      const { transactions } = await createZomeCall('transactions/list_transactions')()
      const listOfNonActionableTransactions = transactions.map(presentTransaction)
      const noDuplicateIds = _.uniqBy(listOfNonActionableTransactions, 'id')
      return noDuplicateIds.filter(tx => tx.status === 'complete').sort((a, b) => a.timestamp < b.timestamp ? -1 : 1)
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
    }
  },
  requests: {
    create: async (counterparty, amount) => {
      const origin = await createZomeCall('transactions/request')({ from: counterparty, amount, deadline: MOCK_DEADLINE })
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
    create: async (counterparty, amount, requestId) => {
      const origin = await createZomeCall('transactions/promise')({ to: counterparty, amount, deadline: MOCK_DEADLINE, requestId })
      return {
        id: requestId || origin, // NOTE: If reqeuestId isn't defined, then offer use origin as the ID (ie. Offer is the initiating transaction).
        amount,
        counterparty,
        direction: DIRECTION.outgoing, // this indicates the hf spender
        status: STATUS.pending,
        type: TYPE.offer,
        timestamp: currentDataTimeIso
      }
    },

    // NOTE: Below we reflect our current change to the receive_payment API; the only param should now be the transaction's origin id
    accept: async (transactionId) => {
      await createZomeCall('transactions/receive_payment')({ origin: transactionId })
      return {
        id: transactionId,
        amount: 0, // NOTE: This data needs to be pulled from the gql cache
        counterparty: 'Data not avail until next refetch, retrieve from gql cache...', // NOTE: This data needs to be pulled from the gql cache
        direction: DIRECTION.incoming, // this indicates the hf recipient
        status: STATUS.complete,
        type: TYPE.offer,
        timestamp: currentDataTimeIso
      }
    },
    // NOTE: Below we reflect our current change to the receive_payment API; the only param should now be the transaction's origin id
    reject: async (transactionId) => {
      await createZomeCall('transactions/reject')({ origin: transactionId })
      return {
        id: transactionId,
        amount: 0, // NOTE: This data needs to be pulled from the gql cache
        counterparty: 'Data not avail until next refetch, retrieve from gql cache...', // NOTE: This data needs to be pulled from the gql cache
        direction: DIRECTION.incoming, // this indicates the hf recipient
        status: STATUS.rejected,
        type: TYPE.offer,
        timestamp: currentDataTimeIso
      }
    }
  }
}

export default HoloFuelDnaInterface
