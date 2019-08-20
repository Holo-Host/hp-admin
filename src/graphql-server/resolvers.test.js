import resolvers from './resolvers'
import mockHhaDnaInterface from 'graphql-server/dnaInterfaces/HhaDnaInterface'
import { getHappDetails as mockGetHappDetails } from 'graphql-server/dnaInterfaces/HappStoreDnaInterface'
import wait from 'waait'

jest.mock('graphql-server/dnaInterfaces/HhaDnaInterface')
jest.mock('graphql-server/dnaInterfaces/HappStoreDnaInterface')

describe('resolvers', () => {
  describe('Query', () => {
    describe('.hostingUser', () => {
      it('calls HhaDnaInterface.currentUser.get', () => {
        resolvers.Query.hostingUser()
        expect(mockHhaDnaInterface.currentUser.get).toHaveBeenCalled()
      })
    })

    describe('.hostPricing', () => {
      it('calls HhaDnaInterface.hostPricing.get', () => {
        resolvers.Query.hostPricing()
        expect(mockHhaDnaInterface.hostPricing.get).toHaveBeenCalled()
      })
    })

    describe('.allAvailableHapps', () => {
      it('calls HhaDnaInterface.happs.allAvailable', async () => {
        resolvers.Query.allAvailableHapps()
        await wait(0)
        expect(mockHhaDnaInterface.happs.allAvailable).toHaveBeenCalled()
        expect(mockGetHappDetails.mock.calls.map(c => c[0])).toEqual(['mockHappOne', 'mockHappTwo'])
      })
    })

    describe('.enableHapp', () => {
      it('calls envoy, enable, and constructs the result happ', async () => {
        resolvers.Query.allAvailableHapps()
        await wait(0)
        expect(mockHhaDnaInterface.happs.allAvailable).toHaveBeenCalled()
        expect(mockGetHappDetails.mock.calls.map(c => c[0])).toEqual(['mockHappOne', 'mockHappTwo'])
      })
    })
  })

  describe('Mutation', () => {
    describe('.registerHostingUser', () => {
      it('calls HhaDnaInterface.currentUser.create', () => {
        resolvers.Mutation.registerHostingUser()
        expect(mockHhaDnaInterface.currentUser.create).toHaveBeenCalled()
      })
    })

    describe('.updateHostPricing', () => {
      it('calls HhaDnaInterface.hostPricing.update', () => {
        const pricePerUnit = '12'
        resolvers.Mutation.updateHostPricing(null, { pricePerUnit })
        expect(mockHhaDnaInterface.hostPricing.update).toHaveBeenCalledWith(pricePerUnit)
      })
    })
  })
})
