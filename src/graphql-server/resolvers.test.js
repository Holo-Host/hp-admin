import resolvers from './resolvers'
import mockHhaDnaInterface from 'graphql-server/dnaInterfaces/HhaDnaInterface'

jest.mock('graphql-server/dnaInterfaces/HhaDnaInterface')

describe('resolvers', () => {
  describe('Query', () => {
    describe('.hostingUser', () => {
      it('calls HhaDnaInterface.currentUser.get', async () => {
        resolvers.Query.hostingUser()
        expect(mockHhaDnaInterface.currentUser.get).toHaveBeenCalled()
      })
    })

    describe('.hostPricing', () => {
      it('calls HhaDnaInterface.hostPricing.get', async () => {
        resolvers.Query.hostPricing()
        expect(mockHhaDnaInterface.hostPricing.get).toHaveBeenCalled()
      })
    })
  })

  describe('Mutation', () => {
    describe('.registerHostingUser', () => {
      it('calls HhaDnaInterface.currentUser.create', async () => {
        resolvers.Mutation.registerHostingUser()
        expect(mockHhaDnaInterface.currentUser.create).toHaveBeenCalled()
      })
    })

    describe('.updateHostPricing', () => {
      it('calls HhaDnaInterface.hostPricing.update', async () => {
        const pricePerUnit = '12'
        resolvers.Mutation.updateHostPricing(null, { pricePerUnit })
        expect(mockHhaDnaInterface.hostPricing.update).toHaveBeenCalledWith(pricePerUnit)
      })
    })
  })
})
