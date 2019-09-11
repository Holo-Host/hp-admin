const currentDataTimeIso = () => new Date().toISOString()

const successfulTransactionResponse = ({ transactionId, amount, counterparty, status, type, fees, presentBalance, notes }) => {
  return {
    id: transactionId,
    amount: amount || 0,
    counterparty: counterparty || 'Data not avail until next refetch, retrieve from gql cache...',
    direction: type === 'offer' ? 'outgoing' : 'incoming',
    status,
    type,
    timestamp: currentDataTimeIso,
    // NOTE: the following details are ONLY available in the 'completed transactions'...
    fees: fees || 0,
    presentBalance: presentBalance || 'no presentBalance provided',
    notes: notes || 'none'
  }
}

const mockHoloFuelDnaInterface = {
  transactions: {
    allComplete: jest.fn(() => ['mockCompleteTransactionOne', 'mockCompleteTransactionTwo']),
    allActionable: jest.fn(() => ['mockActionableTransactionOne', 'mockActionableTransactionTwo']),
    allWaiting: jest.fn(() => ['mockWaitingTransactionOne', 'mockWaitingTransactionTwo'])
  },
  requests: {
    create: jest.fn((counterparty, amount) => successfulTransactionResponse({ transactionId: 'requestHashId', counterparty, amount, status: 'pending', type: 'request' }))
  },
  offers: {
    create: jest.fn((counterparty, amount, requestId) => successfulTransactionResponse({ transactionId: requestId, counterparty, amount, status: 'pending', type: 'offer' })),
    accept: jest.fn(transactionId => successfulTransactionResponse({ transactionId, status: 'complete', type: 'offer' })),
    reject: jest.fn(transactionId => successfulTransactionResponse({ transactionId, status: 'rejected', type: 'offer' }))
  }
}

export default mockHoloFuelDnaInterface
