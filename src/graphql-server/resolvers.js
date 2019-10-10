import HyloDnaInterface from 'data-interfaces/HyloDnaInterface'
import HappStoreDnaInterface, { getHappDetails } from 'data-interfaces/HappStoreDnaInterface'
import HhaDnaInterface from 'data-interfaces/HhaDnaInterface'
import EnvoyInterface from 'data-interfaces/EnvoyInterface'
import HoloFuelDnaInterface from 'data-interfaces/HoloFuelDnaInterface'
import HposInterface from 'data-interfaces/HposInterface'
import { promiseMap } from 'utils'
import {
  dataMappedCall,
  toUiData
} from './dataMapping'
// TODO: dataMapping should probably be happening in the data-interfaces

export const resolvers = {
  Query: {
    me: async () => toUiData('person', await HyloDnaInterface.currentUser.get()),

    // factoring out the function call here breaks tests. Don't understand why
    happStoreUser: () => HappStoreDnaInterface.currentUser.get(),

    hostingUser: HhaDnaInterface.currentUser.get,

    happs: () => promiseMap(HhaDnaInterface.happs.all(), getHappDetails),

    hostPricing: HhaDnaInterface.hostPricing.get,

    holofuelUser: HoloFuelDnaInterface.user.get,

    holofuelCounterparty: (_, { agentId }) => HoloFuelDnaInterface.user.getCounterparty({ agentId }),

    holofuelWaitingTransactions: HoloFuelDnaInterface.transactions.allWaiting,

    holofuelActionableTransactions: HoloFuelDnaInterface.transactions.allActionable,

    holofuelCompletedTransactions: HoloFuelDnaInterface.transactions.allCompleted,

    holofuelLedger: HoloFuelDnaInterface.ledger.get,

    happ: (_, { id }) => {
      const happ = HhaDnaInterface.happs.get(id)
      const happmapped = happ.then(getHappDetails)
      return happmapped
    },

    hposSettings: HposInterface.os.settings
  },

  Mutation: {
    registerUser: (_, userData) => dataMappedCall('person', userData, HyloDnaInterface.currentUser.create),

    registerHostingUser: HhaDnaInterface.currentUser.create,

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

    holofuelRequest: async (_, { counterparty, amount, notes }) => HoloFuelDnaInterface.requests.create(counterparty, amount, notes),

    holofuelOffer: async (_, { counterparty, amount, notes, requestId }) => HoloFuelDnaInterface.offers.create(counterparty, amount, notes, requestId),

    holofuelAcceptOffer: (_, { transactionId }) => HoloFuelDnaInterface.offers.accept(transactionId),

    holofuelDecline: (_, { transactionId }) => HoloFuelDnaInterface.transactions.decline(transactionId),

    holofuelCancel: (_, { transactionId }) => HoloFuelDnaInterface.transactions.cancel(transactionId),

    hposUpdateSettings: (_, { version }) => HposInterface.os.updateSettings({ version })
  }
}

export default resolvers
