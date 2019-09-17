import { TYPE, STATUS, DIRECTION } from 'models/Transaction'

const currentDataTimeIso = () => new Date().toISOString()

const successfulTransactionResponse = ({ transactionId, amount, counterparty, status, type, fees, presentBalance, notes }) => {
  return {
    id: transactionId,
    amount: amount || 0,
    counterparty: counterparty || 'Data not avail until next refetch, retrieve from gql cache...',
    direction: type === TYPE.offer ? DIRECTION.outgoing : DIRECTION.incoming,
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
    create: jest.fn((counterparty, amount) => successfulTransactionResponse({ transactionId: 'requestHashId', counterparty, amount, status: STATUS.pending, type: TYPE.request }))
  },
  offers: {
    create: jest.fn((counterparty, amount, requestId) => successfulTransactionResponse({ transactionId: requestId, counterparty, amount, status: STATUS.pending, type: TYPE.offer })),
    accept: jest.fn(transactionId => successfulTransactionResponse({ transactionId, status: STATUS.complete, type: TYPE.offer })),
    decline: jest.fn(transactionId => successfulTransactionResponse({ transactionId, status: STATUS.rejected, type: TYPE.offer }))
  }
}

export default mockHoloFuelDnaInterface
