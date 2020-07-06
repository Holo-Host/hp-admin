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


let shouldNotShowtransactionsById = []
export const setShouldNotShowtransactionsById = hiddenTransactionIds => {
  shouldNotShowtransactionsById = hiddenTransactionIds
  console.log('>>>>>>>>>>>> shouldNotShowtransactionsById ', shouldNotShowtransactionsById);
  
  return shouldNotShowtransactionsById
}

// we hide cancelled and declined transactions, and offers that are paying a request (those are handled by AcceptRequestedOffers)
export function shouldShowTransactionInInbox (transaction) {
  const { id, status, isPayingARequest, inProcess, actioned } = transaction
  return status !== STATUS.canceled &&
    status !== STATUS.declined &&
    !(isPayingARequest && !inProcess) &&
    !(isPayingARequest && !status === STATUS.pending) &&
    ((actioned && !shouldNotShowtransactionsById.find(tx => tx.id === id)) || !actioned)
}
