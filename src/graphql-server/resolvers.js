import HyloDnaInterface from 'data-interfaces/HyloDnaInterface'
import HappStoreDnaInterface, { getHappDetails } from 'data-interfaces/HappStoreDnaInterface'
import HhaDnaInterface from 'data-interfaces/HhaDnaInterface'
import EnvoyInterface from 'data-interfaces/EnvoyInterface'
import HoloFuelDnaInterface, { getTxCounterparties } from 'data-interfaces/HoloFuelDnaInterface'
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

    holofuelHistoryCounterparties: async () => {
      const completed = await HoloFuelDnaInterface.transactions.allCompleted()
      const waiting = await HoloFuelDnaInterface.transactions.allWaiting()
      const historyTransactions = completed.concat(waiting)
      return getTxCounterparties(historyTransactions)
    },

    holofuelWaitingTransactions: HoloFuelDnaInterface.transactions.allWaiting,

    holofuelActionableTransactions: HoloFuelDnaInterface.transactions.allActionable,

    // NOTE: NonPending includes both completed and rejected/declined transactions.
    holofuelNonPendingTransactions: HoloFuelDnaInterface.transactions.allNonPending,

    holofuelCompletedTransactions: HoloFuelDnaInterface.transactions.allCompleted,

    holofuelNewCompletedTransactions: (_, { since }) => HoloFuelDnaInterface.transactions.allCompleted(since),

    holofuelEarningsTransactions: HoloFuelDnaInterface.transactions.allEarnings,

    holofuelLedger: HoloFuelDnaInterface.ledger.get,

    happ: (_, { id }) => {
      const happ = HhaDnaInterface.happs.get(id)
      const happmapped = happ.then(getHappDetails)
      return happmapped
    },

    hposSettings: (_) => HposInterface.os.settings(),

    hposStatus: HposInterface.os.status,

    hostingReport: () => {
      return {
        localSourceChains: 18,
        zomeCalls: 588,
        hostedHapps: [
          {
            name: 'Holofuel'
          },
          {
            name: 'Communities'
          },
          {
            name: 'H-Wiki'
          }
        ]
      }
    },

    earningsReport: () => {
      return {
        totalEarnings: 650000,
        cpu: 300,
        bandwidth: 300,
        storage: 300
      }
    }
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

    holofuelUpdateUser: (_, { nickname, avatarUrl }) => HoloFuelDnaInterface.user.update(nickname, avatarUrl),

    holofuelRequest: (_, { counterpartyId, amount, notes }) => HoloFuelDnaInterface.requests.create(counterpartyId, amount, notes),

    holofuelOffer: (_, { counterpartyId, amount, notes, requestId }) => HoloFuelDnaInterface.offers.create(counterpartyId, amount, notes, requestId),

    holofuelAcceptOffer: (_, { transactionId }) => HoloFuelDnaInterface.offers.accept(transactionId),

    holofuelDecline: (_, { transactionId }) => HoloFuelDnaInterface.transactions.decline(transactionId),

    holofuelCancel: (_, { transactionId }) => HoloFuelDnaInterface.transactions.cancel(transactionId),

    holofuelRecoverFunds: (_, { transactionId }) => HoloFuelDnaInterface.transactions.recoverFunds(transactionId),

    holofuelRefundTransactions: (_, { transactions }) => HoloFuelDnaInterface.transactions.refundTransactions(transactions),

    hposUpdateSettings: (_, { hostPubKey, hostName, deviceName, sshAccess }) => HposInterface.os.updateSettings(hostPubKey, hostName, deviceName, sshAccess),

    hposUpdateVersion: () => HposInterface.os.updateVersion(),

    hposCheckAuth: async () => {
      let settings
      try {
        settings = await HposInterface.os.settings()
      } catch (error) {
        return {
          isAuthed: false
        }
      }
      return {
        isAuthed: true,
        hposSettings: settings
      }
    }
  }
}

export default resolvers
