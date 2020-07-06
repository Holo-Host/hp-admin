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

// we hide cancelled and declined transactions 
// ...offers that are paying a request and not in process (those are handled by AcceptRequestedOffers)
// ...and actioned transactions that have been hidden explicitly
export function shouldShowTransactionInInbox (transaction) {
  const { status, isPayingARequest, inProcess } = transaction
  return status !== STATUS.canceled &&
    status !== STATUS.declined &&
    !(isPayingARequest && !inProcess) &&
    !(isPayingARequest && !status === STATUS.pending) // &&
    // ((actioned && !shouldNotShowtransactionsById.find(tx => tx.id === id)) || !actioned)
}
