import wait from 'waait'
import resolvers from './resolvers'
import mockHhaDnaInterface from 'data-interfaces/HhaDnaInterface'
import { getHappDetails as mockGetHappDetails } from 'data-interfaces/HappStoreDnaInterface'
import mockEnvoyInterface from 'data-interfaces/EnvoyInterface'
import mockHoloFuelInterface from 'data-interfaces/HoloFuelDnaInterface'

jest.mock('data-interfaces/HhaDnaInterface')
jest.mock('data-interfaces/HappStoreDnaInterface')
jest.mock('data-interfaces/EnvoyInterface')
jest.mock('data-interfaces/HoloFuelDnaInterface')

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

    describe('.holofuelCompleteTransactions', () => {
      it('calls HoloFuelInterface.transactions.allComplete', async () => {
        resolvers.Query.holofuelCompleteTransactions()
        await wait(0)
        expect(mockHoloFuelInterface.transactions.allComplete).toHaveBeenCalled()
      })
    })

    describe('.holofuelWaitingTransactions', () => {
      it('calls HoloFuelInterface.transactions.allWaiting', async () => {
        resolvers.Query.holofuelWaitingTransactions()
        await wait(0)
        expect(mockHoloFuelInterface.transactions.allWaiting).toHaveBeenCalled()
      })
    })

    describe('.holofuelActionableTransactions', () => {
      it('calls HoloFuelInterface.transactions.allActionable', async () => {
        resolvers.Query.holofuelActionableTransactions()
        await wait(0)
        expect(mockHoloFuelInterface.transactions.allActionable).toHaveBeenCalled()
      })
    })

    describe('.holofuelLedger', () => {
      it('calls HoloFuelInterface.transactions.ledger.get', async () => {
        resolvers.Query.holofuelLedger()
        await wait(0)
        expect(mockHoloFuelInterface.ledger.get).toHaveBeenCalled()
      })
    })

    describe('.holofuelUser', () => {
      it('calls HoloFuelInterface.transactions.holofuelUser.get *with* agentId', async () => {
        const agentId = 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r'
        resolvers.Query.holofuelUser(null, { agentId })
        await wait(0)
        expect(mockHoloFuelInterface.user.get).toHaveBeenCalled()
      })

      it('calls HoloFuelInterface.transactions.holofuelUser.get *without* agentId', async () => {
        resolvers.Query.holofuelUser(null, {})
        await wait(0)
        expect(mockHoloFuelInterface.user.get).toHaveBeenCalled()
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
        const units = 'storage'
        const pricePerUnit = '12'
        resolvers.Mutation.updateHostPricing(null, { units, pricePerUnit })
        expect(mockHhaDnaInterface.hostPricing.update).toHaveBeenCalledWith(units, pricePerUnit)
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

    describe('.holofuelRequest', () => {
      it('calls create request and constructs the result transaction', async () => {
        const counterparty = 'HcSCIdm3y8fjJ8g753YEMOo4qdIctqsqrxpIEnph7Fj7dm4ze776bEPDwxoog8a'
        const amount = 200.01
        resolvers.Mutation.holofuelRequest(null, { counterparty, amount })
        await wait(0)
        expect(mockHoloFuelInterface.requests.create).toHaveBeenCalledWith(counterparty, amount)
      })
    })

    describe('.holofuelOffer', () => {
      it('calls create offer and constructs the result transaction', async () => {
        const counterparty = 'HcSCIdm3y8fjJ8g753YEMOo4qdIctqsqrxpIEnph7Fj7dm4ze776bEPDwxoog8a'
        const amount = 200.01
        const requestId = 'Qmbm4B1u3rN8ua39QwDkjmxssmcKzj4nMngbqnxU7fDfQE'
        resolvers.Mutation.holofuelOffer(null, { counterparty, amount, requestId })
        await wait(0)
        expect(mockHoloFuelInterface.offers.create).toHaveBeenCalledWith(counterparty, amount, requestId)
      })
    })

    describe('.holofuelAcceptOffer', () => {
      it('calls accept offer and constructs the result transaction', async () => {
        const transactionId = 'Qmbm4B1u3rN8ua39QwDkjmxssmcKzj4nMngbqnxU7fDfQE'
        resolvers.Mutation.holofuelAcceptOffer(null, { transactionId })
        await wait(0)
        expect(mockHoloFuelInterface.offers.accept).toHaveBeenCalledWith(transactionId)
      })
    })

    describe('.holofuelRejectOffer', () => {
      it('calls reject offer and constructs the result transaction', async () => {
        const transactionId = 'Qmbm4B1u3rN8ua39QwDkjmxssmcKzj4nMngbqnxU7fDfQE'
        resolvers.Mutation.holofuelRejectOffer(null, { transactionId })
        await wait(0)
        expect(mockHoloFuelInterface.offers.reject).toHaveBeenCalledWith(transactionId)
      })
    })
  })
})
