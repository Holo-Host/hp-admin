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

export const FAILED_TRANSACTION_MESSAGE = 'The recipient for the transaction could not be found. The transaction will appear as declined.'

// Any cancelled and declined transactions, or
// offers that are paying a request (those are handled by AcceptRequestedOffers)
// are not actionable transactions
const isActionableTx = ({ status, isPayingARequest }) => {
  return status !== STATUS.canceled &&
    status !== STATUS.declined &&
    !(isPayingARequest && !status === STATUS.pending)
}

// For the notification badge, we filter based on isActionableTx, plus
// if the transactions are in process or actioned
export function shouldShowTransactionAsActionable (transaction) {
  const { inProcess, isActioned } = transaction
  return isActionableTx(transaction) &&
    !inProcess &&
    !isActioned
}

// ...and in the inbox view we filter based on isActionableTx, but only hide actioned transactions that have been hidden explicitly
// from inbox, instead of all removing all actioned or any inProcess
export const shouldShowTransactionInInbox = (transaction, hiddenTransactionIds) => {
  const { id, isPayingARequest, inProcess, isActioned } = transaction
  return isActionableTx(transaction) &&
  !(isPayingARequest && !inProcess) &&
  ((isActioned && !hiddenTransactionIds.find(txId => txId === id)) || !isActioned)
}
