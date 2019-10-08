import wait from 'waait'
import resolvers from './resolvers'
import mockHhaDnaInterface from 'data-interfaces/HhaDnaInterface'
import { getHappDetails as mockGetHappDetails } from 'data-interfaces/HappStoreDnaInterface'
import mockEnvoyInterface from 'data-interfaces/EnvoyInterface'
import mockHoloFuelInterface from 'data-interfaces/HoloFuelDnaInterface'
import mockHposInterface from 'data-interfaces/HposInterface'

jest.mock('data-interfaces/HhaDnaInterface')
jest.mock('data-interfaces/HappStoreDnaInterface')
jest.mock('data-interfaces/EnvoyInterface')
jest.mock('data-interfaces/HoloFuelDnaInterface')
jest.mock('data-interfaces/HposInterface')

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

    describe('.holofuelCompletedTransactions', () => {
      it('calls HoloFuelInterface.transactions.allCompleted', async () => {
        resolvers.Query.holofuelCompletedTransactions()
        await wait(0)
        expect(mockHoloFuelInterface.transactions.allCompleted).toHaveBeenCalled()
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

    describe('.holofuelCounterparty', () => {
      it('calls HoloFuelDnaInterface.user.getCounterparty with agentId', async () => {
        const agentId = 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r'
        resolvers.Query.holofuelCounterparty(null, { agentId })
        await wait(0)
        expect(mockHoloFuelInterface.user.getCounterparty).toHaveBeenCalledWith({ agentId })
      })
    })

    describe('.holofuelUser', () => {
      it('calls HoloFuelDnaInterface.user.get', async () => {
        resolvers.Query.holofuelUser()
        await wait(0)
        expect(mockHoloFuelInterface.user.get).toHaveBeenCalled()
      })
    })

    describe('.hposSettings', () => {
      it('calls HposInterface.os.settings', async () => {
        resolvers.Query.hposSettings()
        await wait(0)
        expect(mockHposInterface.os.settings).toHaveBeenCalled()
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
        const notes = 'Hi there'
        resolvers.Mutation.holofuelRequest(null, { counterparty, amount, notes })
        await wait(0)
        expect(mockHoloFuelInterface.requests.create).toHaveBeenCalledWith(counterparty, amount, notes)
      })
    })

    describe('.holofuelOffer', () => {
      it('calls create offer and constructs the result transaction', async () => {
        const counterparty = 'HcSCIdm3y8fjJ8g753YEMOo4qdIctqsqrxpIEnph7Fj7dm4ze776bEPDwxoog8a'
        const amount = 200.01
        const notes = 'Hi there'
        const requestId = 'Qmbm4B1u3rN8ua39QwDkjmxssmcKzj4nMngbqnxU7fDfQE'
        resolvers.Mutation.holofuelOffer(null, { counterparty, amount, notes, requestId })
        await wait(0)
        expect(mockHoloFuelInterface.offers.create).toHaveBeenCalledWith(counterparty, amount, notes, requestId)
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

    describe('.holofuelDecline', () => {
      it('calls reject offer and constructs the result transaction', async () => {
        const transactionId = 'Qmbm4B1u3rN8ua39QwDkjmxssmcKzj4nMngbqnxU7fDfQE'
        resolvers.Mutation.holofuelDecline(null, { transactionId })
        await wait(0)
        expect(mockHoloFuelInterface.transactions.decline).toHaveBeenCalledWith(transactionId)
      })
    })

    describe('.holofuelCancel', () => {
      it('calls cancel request and constructs the result transaction', async () => {
        const transactionId = 'Qmbm4B1u3rN8ua39QwDkjmxssmcKzj4nMngbqnxU7fDfQE'
        resolvers.Mutation.holofuelCancel(null, { transactionId })
        await wait(0)
        expect(mockHoloFuelInterface.transactions.cancel).toHaveBeenCalledWith(transactionId)
      })
    })
  })
})
