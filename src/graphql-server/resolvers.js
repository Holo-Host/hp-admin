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

    // holofuelUser: (_, { agentId }) => HoloFuelDnaInterface.user.get({ agentId }),

    // holofuelWaitingTransactions: () => HoloFuelDnaInterface.transactions.allWaiting(),

    holofuelActionableTransactions: () => HoloFuelDnaInterface.transactions.allActionable(),

    holofuelCompleteTransactions: () => HoloFuelDnaInterface.transactions.allComplete(),

    holofuelLedger: () => HoloFuelDnaInterface.ledger.get(),

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

    holofuelRequest: async (_, { counterparty, amount }) => HoloFuelDnaInterface.requests.create(counterparty, amount),

    holofuelOffer: async (_, { counterparty, amount, requestId }) => HoloFuelDnaInterface.offers.create(counterparty, amount, requestId),

    holofuelAcceptOffer: (_, { transactionId }) => HoloFuelDnaInterface.offers.accept(transactionId),

    holofuelDecline: (_, { transactionId }) => HoloFuelDnaInterface.transactions.decline(transactionId)

  }
}

export default resolvers
