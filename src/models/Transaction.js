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

// we hide cancelled and declined transactions, and offers that are paying a request (those are handled by AcceptRequestedOffers)
export function shouldShowTransactionInInbox (transaction) {
  return transaction.status !== STATUS.canceled &&
    transaction.status !== STATUS.declined &&
    !(transaction.isPayingARequest && !transaction.inProcess) &&
    !(transaction.isPayingARequest && !transaction.status === STATUS.pending)
}
