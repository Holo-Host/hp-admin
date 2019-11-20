import _ from 'lodash'
import { pickBy } from 'lodash/fp'
import { instanceCreateZomeCall } from '../holochainClient'
import { TYPE, STATUS, DIRECTION } from 'models/Transaction'
import { UNITS } from 'models/HostPricing'
import { promiseMap } from 'utils'

// This first part is temporary mock data to be replaced once we have figured out how getting the earnings transactions work.

const testEarnings = [{
  id: 1,
  timestamp: '2019-08-30T22:20:25.106Z',
  amount: 123,
  pricePerUnit: 5,
  units: UNITS.cpu,
  happName: 'Community'
},
{
  id: 2,
  timestamp: '2019-08-30T18:20:25.106Z',
  amount: 150,
  pricePerUnit: 15,
  units: UNITS.storage,
  happName: 'HoloFuel'
},
{
  id: 3,
  timestamp: '2019-08-30T14:20:25.106Z',
  amount: 80,
  pricePerUnit: 10,
  units: UNITS.bandwidth,
  happName: 'Personas'
},
{
  id: 4,
  timestamp: '2019-08-29T14:20:25.106Z',
  amount: 80,
  pricePerUnit: 10,
  units: UNITS.bandwidth,
  happName: 'Personas'
},
{
  id: 5,
  timestamp: '2019-08-28T14:20:25.106Z',
  amount: 343,
  pricePerUnit: 50,
  units: UNITS.cpu,
  happName: 'HoloFuel'
},
{
  id: 6,
  timestamp: '2019-08-27T14:20:25.106Z',
  amount: 123,
  pricePerUnit: 1,
  units: UNITS.ram,
  happName: 'Personas'
},
{
  id: 7,
  timestamp: '2019-08-26T14:20:25.106Z',
  amount: 10,
  pricePerUnit: 10,
  units: UNITS.bandwidth,
  happName: 'HoloFuel'
},
{
  id: 8,
  timestamp: '2019-08-26T12:20:25.106Z',
  amount: 389,
  pricePerUnit: 5,
  units: UNITS.cpu,
  happName: 'Community'
},
{
  id: 9,
  timestamp: '2019-08-26T10:20:25.106Z',
  amount: 45,
  pricePerUnit: 10,
  units: UNITS.bandwidth,
  happName: 'Personas'
},
{
  id: 10,
  timestamp: '2019-08-25T14:20:25.106Z',
  amount: 920,
  pricePerUnit: 15,
  units: UNITS.storage,
  happName: 'HoloFuel'
},
{
  id: 11,
  timestamp: '2019-08-19T14:20:25.106Z',
  amount: 56,
  pricePerUnit: 100,
  units: UNITS.cpu,
  happName: 'HoloFuel'
},
{
  id: 12,
  timestamp: '2019-08-18T14:20:25.106Z',
  amount: 805,
  pricePerUnit: 20,
  units: UNITS.bandwidth,
  happName: 'Community'
},
{
  id: 13,
  timestamp: '2019-08-17T14:20:25.106Z',
  amount: 10,
  pricePerUnit: 25,
  units: UNITS.ram,
  happName: 'HoloFuel'
},
{
  id: 14,
  timestamp: '2019-08-16T14:20:25.106Z',
  amount: 734,
  pricePerUnit: 200,
  units: UNITS.storage,
  happName: 'Personas'
},
{
  id: 15,
  timestamp: '2019-08-16T12:20:25.106Z',
  amount: 200,
  pricePerUnit: 3,
  units: UNITS.cpu,
  happName: 'Personas'
},
{
  id: 16,
  timestamp: '2019-08-16T10:20:25.106Z',
  amount: 505,
  pricePerUnit: 11,
  units: UNITS.bandwidth,
  happName: 'Community'
},
{
  id: 17,
  timestamp: '2019-08-15T14:20:25.106Z',
  amount: 438,
  pricePerUnit: 35,
  units: UNITS.bandwidth,
  happName: 'HoloFuel'
}]

const now = (new Date()).getTime()
const thirtyDays = 30 * 24 * 60 * 60 * 1000

const mockEarnings = Array.from({ length: 200 }, (_, id) => ({
  id,
  timestamp: new Date(now - Math.floor(Math.random() * thirtyDays)).toISOString(),
  amount: Math.floor(Math.random() * 1000),
  pricePerUnit: 5,
  units: UNITS.cpu,
  happName: ['Community', 'Holofuel'][Math.floor(Math.random() * 2)]
})).sort((a, b) => a.timestamp < b.timestamp ? 1 : -1)

const allEarnings = async () => {
  if (process.env.NODE_ENV === 'test') {
    return testEarnings
  } else {
    return mockEarnings
  }
}

export const currentDataTimeIso = () => new Date().toISOString()

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
    case 'rejected': {
      // We have decided to show this **only** in the inbox page via the recent transactions filter
      if (event.Request) return presentRequest({ origin, event, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees, status: STATUS.rejected })
      if (event.Promise) return presentOffer({ origin, event, stateDirection, eventTimestamp: timestamp.event, fees: parsedAdjustment.fees, status: STATUS.rejected })
      throw new Error('Completed event did not have a Receipt or Cheque event')
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
      if (result.error) throw new Error('There was an error locating the current holofuel agent nickname. ERROR: ', result.error)

      return {
        id: result.agent_id.pub_sign_key,
        nickname: result.agent_id.nick
      }
    },
    getCounterparty: async ({ agentId }) => {
      const result = await createZomeCall('transactions/whois')({ agents: agentId })
      if (result.error || !result[0].Ok) throw new Error('There was an error locating the counterparty agent nickname. ERROR: ', result.error)

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
      return actionableTransactions.sort((a, b) => a.timestamp < b.timestamp ? -1 : 1)
    },
    allWaiting: async () => {
      const { transactions } = await createZomeCall('transactions/list_transactions')()
      const listOfNonActionableTransactions = transactions.map(presentTransaction)
      // NOTE: Filtering out duplicate IDs should prevent an already completed tranaction from displaying as a pending tranaction if any lag occurs in data update layer.
      const noDuplicateIds = _.uniqBy(listOfNonActionableTransactions, 'id')
      return noDuplicateIds.filter(tx => tx.status === 'pending').sort((a, b) => a.timestamp < b.timestamp ? -1 : 1)
    },
    allEarnings: allEarnings,
    allNonPending: async () => {
      const { transactions } = await createZomeCall('transactions/list_transactions')()
      const listOfNonActionableTransactions = transactions.map(presentTransaction)
      const noDuplicateIds = _.uniqBy(listOfNonActionableTransactions, 'id')
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
    // decline pending proposed transaction (NB: proposed by another agent).
    decline: async (transactionId) => {
      const transaction = await HoloFuelDnaInterface.transactions.getPending(transactionId)
      await createZomeCall('transactions/decline')({ origin: transactionId })
      return {
        ...transaction,
        id: transactionId,
        status: STATUS.rejected
      }
    },
    // cancel pending authored transaction.
    cancel: async (transactionId) => {
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
