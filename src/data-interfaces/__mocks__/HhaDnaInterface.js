const mockHhaDnaInterface = {
  currentUser: {
    get: jest.fn(),
    create: jest.fn()
  },

  happs: {
    get: jest.fn(appId => ({ appId })),
    all: jest.fn(() => ['mockHappOne', 'mockHappTwo']),
    enable: jest.fn(appId => appId),
    disable: jest.fn(appId => appId)
  },

  hostPricing: {
    get: jest.fn(),
    update: jest.fn()
  }
}

export default mockHhaDnaInterface
