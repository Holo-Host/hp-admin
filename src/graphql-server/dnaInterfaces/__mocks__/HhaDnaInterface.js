const mockHhaDnaInterface = {
  currentUser: {
    get: jest.fn(),
    create: jest.fn()
  },

  happs: {
    get: jest.fn(appId => appId),
    allAvailable: jest.fn(() => ['mockHappOne', 'mockHappTwo']),
    enableHapp: jest.fn(appId => appId),
    disableHapp: jest.fn(appId => appId)
  },

  hostPricing: {
    get: jest.fn(),
    update: jest.fn()
  }
}

export default mockHhaDnaInterface
