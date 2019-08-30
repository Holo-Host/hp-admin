const mockHoloFuelDnaInterface = {
  transactions: {
    allComplete: jest.fn(() => ['mockCompleteTransactionOne', 'mockCompleteTransactionTwo']),
    allActionable: jest.fn(() => ['mockActionableTransactionOne', 'mockActionableTransactionTwo']),
    allWaiting: jest.fn(() => ['mockWaitingTransactionOne', 'mockWaitingTransactionTwo'])
  },
  requests: {
    create: jest.fn()
  },
  offers: {
    create: jest.fn(),
    accept: jest.fn()
  }
}

export default mockHoloFuelDnaInterface
