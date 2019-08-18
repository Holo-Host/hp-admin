import resolvers from './resolvers'
import { hostingUserId } from 'mock-dnas/hha'
import mockData from 'mock-dnas/mockData'
import mockHhaDnaInterface from 'graphql-server/dnaInterfaces/HhaDnaInterface'

jest.mock('graphql-server/dnaInterfaces/HhaDnaInterface')

describe('resolvers', () => {
  describe('Query', () => {
    describe('.hostingUser', () => {
      it.skip('returns expected results', async () => {
        const hostingUser = await resolvers.Query.hostingUser()
        expect(hostingUser).toMatchObject({
          id: hostingUserId,
          isRegistered: false
        })
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
      it.skip('returns expected results', async () => {
        const spy = jest.spyOn(mockData.hha.host, 'register_as_host')
        const hostingUser = await resolvers.Mutation.registerHostingUser()

        expect(hostingUser).toMatchObject({
          id: hostingUserId,
          isRegistered: true
        })

        expect(spy).toHaveBeenCalled()
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
