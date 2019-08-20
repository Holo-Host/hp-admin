import { instanceCreateZomeCall } from '../holochainClient'
import { pick } from 'lodash/fp'

export const INSTANCE_ID = 'holofuel'
const createZomeCall = instanceCreateZomeCall(INSTANCE_ID)

// TODO : Finish Mocking below & optimize
export const HoloFuelDnaInterface = {
  transactions: {
    getAllPending: () => createZomeCall('transactions/list_pending')()
      .then(hfTx => hfTx.map(shapePendingTransactionBody)),
    getAllComplete: () => createZomeCall('transactions/list_transactions')()
      .then(hfTx => hfTx.transactions.map(shapeCompleteTransactionBody)),
    getAll: async () => {
      const pendingTx = await HoloFuelDnaInterface.transactions.getAllPending()
      const completedTx = await HoloFuelDnaInterface.transactions.getAllComplete()
      return dataRefactor(pendingTx.concat(completedTx))
    }
  },
  ledger: {
    balance: () => {}
  }
}

export function shapePendingTransactionBody (tx) {
  const promiseList = tx.promises.map((p) => {
    return {
      originTimeStamp: p.event[1],
      amount: p.event[2].Promise.tx.amount,
      fee: p.event[2].Promise.tx.fee,
      originEvent: p.event[2].Promise.request ? 'Request' : 'Promise',
      event: 'Promise',
      counterparty: p.event[2].Promise.tx.from,
      txAuthor: p.event[2].Promise.tx.to,
      status: 'pending/recipient',
      dueDate: p.event[2].Promise.tx.deadline,
      notes: p.event[2].Promise.tx.notes,
      originCommitHash: p.event[2].Promise.request ? p.event[2].Promise.request : p.event[0], // the tx origin commit hash
      eventCommitHash: p.event[0], // the 'origin' promise commit hash
      inResponseToTX: p.event[2].Promise.request || undefined, // the request hash that the promise is in response to, should it exist...
      transactionTimestamp: p.event[1],
      promiseCommitSignature: p.provenance[1]
    }
  })

  const requestList = tx.requests.map((r) => {
    return {
      originTimeStamp: r.event[1],
      amount: r.event[2].Request.amount,
      fee: r.event[2].Request.fee,
      originEvent: 'Request',
      event: 'Request',
      counterparty: r.event[2].Request.to,
      txAuthor: r.event[2].Request.from,
      status: 'pending/spender',
      dueDate: r.event[2].Request.deadline,
      notes: r.event[2].Request.notes,
      originCommitHash: r.event[0],
      eventCommitHash: r.event[0], // commit hash for the currently displayed Transaction === the origin commit hash in this cirumstance
      inResponseToTX: undefined,
      transactionTimestamp: r.event[1],
      requestCommitSignature: r.provenance[1]
    }
  })
  return dataRefactor(promiseList.concat(requestList))
}

export function shapeCompleteTransactionBody (tx) {
  const event = tx.event
  let txEvent
  let originEvent
  let amount = null
  let fee = null
  let counterparty
  let dueDate
  let notes
  let originCommitHash
  let inResponseToTX

  if (event.Request) {
    txEvent = 'Request'
    originEvent = 'Request'
    amount = event.Request.amount
    fee = event.Request.fee
    counterparty = event.Request.from
    dueDate = event.Request.deadline
    notes = event.Request.notes
    inResponseToTX = undefined
    originCommitHash = tx.timestamp.origin
  } else if (event.Promise) {
    txEvent = 'Promise'
    originEvent = event.Promise.request ? 'Request' : 'Promise'
    amount = event.Promise.tx.amount
    fee = event.Promise.tx.fee
    counterparty = event.Promise.tx.to
    dueDate = event.Promise.tx.deadline
    notes = event.Promise.tx.notes
    inResponseToTX = event.Promise.request// the request hash that the promise is in response to, should it exist...
    originCommitHash = event.Promise.request ? event.Promise.request : tx.timestamp.origin // tx origin commit hash
  } else if (event.Invoice) {
    txEvent = 'Invoice'
    originEvent = event.Invoice.promise.request ? 'Request' : 'Promise'
    amount = event.Invoice.promise.tx.amount
    fee = event.Invoice.promise.tx.fee
    counterparty = event.Invoice.promise.tx.from
    dueDate = event.Invoice.promise.tx.deadline
    notes = event.Invoice.promise.tx.notes
    inResponseToTX = event.Invoice.promise.request// the request hash that the promise is in response to, should it exist...
    originCommitHash = event.Invoice.promise.request ? event.Invoice.promise.request : tx.timestamp.origin // tx origin commit hash
  } else if (event.Receipt) {
    txEvent = 'Receipt'
    originEvent = event.Receipt.cheque.invoice.promise.request ? 'Request' : 'Promise'
    amount = event.Receipt.cheque.invoice.promise.tx.amount
    fee = event.Receipt.cheque.invoice.promise.tx.fee
    counterparty = event.Receipt.cheque.invoice.promise.tx.from
    dueDate = event.Receipt.cheque.invoice.promise.tx.deadline
    notes = event.Receipt.cheque.invoice.promise.tx.notes
    inResponseToTX = event.Receipt.cheque.invoice.promise.request// the request hash that the promise is in response to, should it exist...
    originCommitHash = event.Receipt.cheque.invoice.promise.request ? event.Receipt.cheque.invoice.promise.request : tx.timestamp.origin // tx origin commit hash
  } else if (event.Cheque) {
    txEvent = 'Cheque'
    originEvent = event.Cheque.invoice.promise ? 'Request' : 'Promise'
    amount = event.Cheque.invoice.promise.tx.amount
    fee = event.Cheque.invoice.promise.tx.fee
    counterparty = event.Cheque.invoice.promise.tx.to
    dueDate = event.Cheque.invoice.promise.tx.deadline
    notes = event.Cheque.invoice.promise.tx.notes
    inResponseToTX = event.Cheque.invoice.promise.request// the request hash that the promise is in response to, should it exist...
    originCommitHash = event.Cheque.invoice.promise.request ? event.Cheque.invoice.promise.request : tx.timestamp.origin // tx origin commit hash
  }

  const completedTransactionList = {
    originCommitHash, // tx origin commit hash
    eventCommitHash: tx.origin, // 'origin' commit hash for the currently displayed Transaction
    amount,
    fee,
    originEvent,
    event: txEvent,
    counterparty,
    status: tx.state,
    originTimeStamp: tx.timestamp.origin,
    dueDate: dueDate,
    notes: notes,
    inResponseToTX,
    transactionTimestamp: tx.timestamp.event
  }
  return dataRefactor(completedTransactionList)
}

// DATA STRUCTURE FOR TRANSACTION TYPES
const dataRefactor = (transactionDetails) => {
  const appListLength = transactionDetails.length

  const range = (length) => {
    const lengthArray = []
    for (let i = 0; i < length; i++) {
      lengthArray.push(i)
    }
    return lengthArray
  }

  const insertAppDetails = (transaction) => {
    if (transaction !== parseInt(transaction, 10)) {
      return {
        originEvent: transaction.originEvent === 'Request' ? 'Requested' : 'Sent',
        txAuthor: transaction.txAuthor || null,
        promiseCommitSignature: transaction.promiseCommitSignature || null,
        ...pick([
          'originTimeStamp',
          'transactionTimestamp',
          'counterparty',
          'amount',
          'fee',
          'event',
          'status',
          'eventCommitHash',
          'dueDate',
          'notes',
          'originCommitHash',
          'inResponseToTX'
        ], transaction)
      }
    }
  }

  const dataGenerate = (length = appListLength) => {
    return transactionDetails.map((transaction) => {
      return {
        ...insertAppDetails(transaction),
        children: range(length - 1).map(insertAppDetails) // # per page...
      }
    })
  }
  return dataGenerate()
}

export default HoloFuelDnaInterface
