import { instanceCreateZomeCall } from '../holochainClient'
const DEADLINE = '4019-01-01'

export const INSTANCE_ID = 'holofuel'
const createZomeCall = instanceCreateZomeCall(INSTANCE_ID)

const presentOffer = ({origin, event}) = {
  const typeKey = event.Request ? 'Request' : 'Promise'
  return {
    id: origin,
    amount: event.Promise.tx.amount,
    counterparty: event.Promise.tx.to,
    status: 'pending',
    type: offer
  }
}

// const presentRequest = () => {
// }

const presentTransaction = (transaction) => transaction.event.Request ? presentRequest(transaction) : presentOffer(transaction)

const HolofuelDnaInterface = {
  transactions: {
    allComplete: async () => {
      const { transactions } = await createZomeCall('transactions/list_transactions')()
      return transactions.map(presentTransaction)
    },
    allPending: () => {
      const transactions = await createZomeCall('transactions/list_pending')()

      // TODO: Parse Pending Transaction obj.  Currently we're returning an empty array.
      return transactions
    }
  },
  requests: {
    create: async (counterparty, amount) => {
      const origin = await createZomeCall('transactions/request')({ from: counterparty, amount, deadline: DEADLINE })
      return {
        id: origin,
        amount,
        counterparty,
        status: 'pending',
        type: 'request'
      }
    }
  },
  offers: {
    create: async (counterparty, amount, requestId) => {
      const origin = await createZomeCall('transactions/promise')({ to: counterparty, amount, deadline: DEADLINE, requestId })
      return {
        id: requestId || origin, // NOTE: If reqeuestId isn't defined, then offer use origin as the ID (ie. Offer is the initiating transaction).
        amount,
        counterparty,
        status: 'pending',
        type: 'offer'
      }
    },
    // NOTE: Below we reflect our current change to the receive_payment API; the only param will be thte transaction's origin id

    accept: async (transactionId) => {
      await createZomeCall('transactions/receive_payment')({ origin: transactionId })
      return {
        id: transactionId,
        status: 'complete',
        type: 'offer'
      }
    }
  }
}

export default HolofuelDnaInterface
