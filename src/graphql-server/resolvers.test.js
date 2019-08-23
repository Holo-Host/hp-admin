import wait from 'waait'
import resolvers from './resolvers'
import mockHhaDnaInterface from 'graphql-server/dnaInterfaces/HhaDnaInterface'
import { getHappDetails as mockGetHappDetails } from 'graphql-server/dnaInterfaces/HappStoreDnaInterface'
import mockEnvoyInterface from 'graphql-server/dnaInterfaces/EnvoyInterface'

jest.mock('graphql-server/dnaInterfaces/HhaDnaInterface')
jest.mock('graphql-server/dnaInterfaces/HappStoreDnaInterface')
jest.mock('graphql-server/dnaInterfaces/EnvoyInterface')

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

    describe('.happs', () => {
      it('calls HhaDnaInterface.happs.all', async () => {
        resolvers.Query.happs()
        await wait(0)
        expect(mockHhaDnaInterface.happs.all).toHaveBeenCalled()
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

    describe('.enableHapp', () => {
      it('calls envoy, enable, and constructs the result happ', async () => {
        const appId = 'idOfAppToEnable'
        resolvers.Mutation.enableHapp(null, { appId })
        await wait(0)
        expect(mockEnvoyInterface.happs.install).toHaveBeenCalledWith(appId)
        expect(mockHhaDnaInterface.happs.enable).toHaveBeenCalledWith(appId)
        expect(mockHhaDnaInterface.happs.get).toHaveBeenCalledWith(appId)
        expect(mockGetHappDetails).toHaveBeenCalledWith({
          appId,
          isEnabled: true
        })
      })
    })

    describe('.disableHapp', () => {
      it('calls disable and constructs the result happ', async () => {
        const appId = 'idOfAppToEnable'
        resolvers.Mutation.disableHapp(null, { appId })
        await wait(0)
        expect(mockHhaDnaInterface.happs.disable).toHaveBeenCalledWith(appId)
        expect(mockHhaDnaInterface.happs.get).toHaveBeenCalledWith(appId)
        expect(mockGetHappDetails).toHaveBeenCalledWith({
          appId,
          isEnabled: false
        })
      })
    })
  })
})
