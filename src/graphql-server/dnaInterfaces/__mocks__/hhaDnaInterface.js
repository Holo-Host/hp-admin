const mockHhaDnaInterface = {
  currentUser: {
    get: jest.fn(),
    create: jest.fn()
  },

  hostPricing: {
    get: jest.fn(),
    update: jest.fn()
  }
}

export default mockHhaDnaInterface
