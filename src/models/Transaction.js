export const TYPE = {
  offer: 'offer',
  request: 'request'
}

export const STATUS = {
  pending: 'pending',
  completed: 'completed',
  canceled: 'canceled',
  declined: 'declined'
}

export const DIRECTION = {
  incoming: 'incoming',
  outgoing: 'outgoing'
}

export const FAILED_TRANSACTION_MESSAGE = 'The recipient for the transaction could not be found.  The transaction will appear as declined'

// we hide cancelled and declined transactions
// ...offers that are paying a request and not in process (those are handled by AcceptRequestedOffers)
export function shouldShowTransactionInInbox (transaction) {
  const { status, isPayingARequest, inProcess } = transaction
  return status !== STATUS.canceled &&
    status !== STATUS.declined &&
    !(isPayingARequest && !inProcess) &&
    !(isPayingARequest && !status === STATUS.pending) // &&
}

// ...and also hide actioned transactions that have been hidden explicitly
// from actionable notification badge and inbox
export const shouldShowTransactionAsActionable = (transaction, hiddenTransactionIds) => {
  const { id, isActioned } = transaction
  return shouldShowTransactionInInbox(transaction) &&
  ((isActioned && !hiddenTransactionIds.find(txId => txId === id)) || !isActioned)
}
