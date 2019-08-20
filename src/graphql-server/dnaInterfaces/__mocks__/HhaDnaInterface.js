const mockHhaDnaInterface = {
  currentUser: {
    get: jest.fn(),
    create: jest.fn()
  },

  happs: {
    allAvailable: jest.fn(() => ['mockHappOne', 'mockHappTwo'])
  },

  hostPricing: {
    get: jest.fn(),
    update: jest.fn()
  }
}

export default mockHhaDnaInterface
