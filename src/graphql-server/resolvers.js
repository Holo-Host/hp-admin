import HyloDnaInterface from 'data-interfaces/HyloDnaInterface'
import HappStoreDnaInterface, { getHappDetails } from 'data-interfaces/HappStoreDnaInterface'
import HhaDnaInterface from 'data-interfaces/HhaDnaInterface'
import EnvoyInterface from 'data-interfaces/EnvoyInterface'
import HoloFuelDnaInterface from 'data-interfaces/HoloFuelDnaInterface'
import { promiseMap } from 'utils'
import {
  dataMappedCall,
  toUiData
} from './dataMapping'
// TODO: dataMapping should probably be happening in the data-interfaces

export const resolvers = {
  Query: {
    me: async () => toUiData('person', await HyloDnaInterface.currentUser.get()),

    happStoreUser: () => HappStoreDnaInterface.currentUser.get(),

    hostingUser: () => HhaDnaInterface.currentUser.get(),

    happs: () => promiseMap(HhaDnaInterface.happs.all(), getHappDetails),

    hostPricing: () => HhaDnaInterface.hostPricing.get(),

    holofuelWaitingTransactions: () => HoloFuelDnaInterface.transactions.allWaiting(),

    holofuelActionableTransactions: () => HoloFuelDnaInterface.transactions.allActionable(),

    holofuelCompleteTransactions: () => HoloFuelDnaInterface.transactions.allComplete(),

    holofuelLedgerState: () => HoloFuelDnaInterface.ledger.all()

    happ: (_, { id }) => {
      const happ = HhaDnaInterface.happs.get(id)
      const happmapped = happ.then(getHappDetails)
      return happmapped
    }
  },

  Mutation: {
    registerUser: (_, userData) => dataMappedCall('person', userData, HyloDnaInterface.currentUser.create),

    registerHostingUser: () => HhaDnaInterface.currentUser.create(),

    enableHapp: async (_, { appId }) => {
      const success = await EnvoyInterface.happs.install(appId)
      if (!success) throw new Error('Failed to install app in Envoy')
      await HhaDnaInterface.happs.enable(appId)
      const happ = {
        ...await HhaDnaInterface.happs.get(appId),
        isEnabled: true
      }
      return getHappDetails(happ)
    },

    disableHapp: async (_, data) => {
      const { appId } = data
      await HhaDnaInterface.happs.disable(appId)
      const happ = {
        ...await HhaDnaInterface.happs.get(appId),
        isEnabled: false
      }
      return getHappDetails(happ)
    },

    updateHostPricing: (_, { units, pricePerUnit }) => HhaDnaInterface.hostPricing.update(units, pricePerUnit),

    holofuelRequest: async (_, { counterparty, amount }) => {
      const newRequest = await HoloFuelDnaInterface.requests.create(counterparty, amount)
      // Logging this out for demo:
      console.log('The new HF Request transaction body : ', newRequest)
      return newRequest
    },

    holofuelOffer: async (_, { counterparty, amount, requestId }) => {
      const newOffer = await HoloFuelDnaInterface.offers.create(counterparty, amount, requestId)
      // Logging this out for demo:
      console.log('The new HF Offer transaction body : ', newOffer)
      return newOffer
    },

    holofuelAcceptOffer: (_, { transactionId }) => HoloFuelDnaInterface.offers.accept(transactionId),

    holofuelRejectOffer: (_, { transactionId }) => HoloFuelDnaInterface.offers.reject(transactionId)
  }
}

export default resolvers
