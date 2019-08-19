import HyloDnaInterface from './dnaInterfaces/HyloDnaInterface'
import HappStoreDnaInterface, { getHappDetails } from './dnaInterfaces/HappStoreDnaInterface'
import HhaDnaInterface from './dnaInterfaces/HhaDnaInterface'
import EnvoyInterface from './dnaInterfaces/EnvoyInterface'
import HoloFuelInterface from './dnaInterfaces/HolofuelDnaInterface'

import { promiseMap } from 'utils'
import {
  dataMappedCall,
  toUiData
} from './dataMapping'
// TODO: dataMapping should probably be happening in the dnainterfaces

export const resolvers = {
  Query: {
    me: async () => toUiData('person', await HyloDnaInterface.currentUser.get()),

    happStoreUser: () => HappStoreDnaInterface.currentUser.get(),

    hostingUser: () => HhaDnaInterface.currentUser.get(),

    allHapps: () => HappStoreDnaInterface.happs.all(),

    allAvailableHapps: () => promiseMap(HhaDnaInterface.happs.allAvailable(), getHappDetails),

    allHostedHapps: () => promiseMap(HhaDnaInterface.happs.allHosted(), getHappDetails),

    hostPricing: () => HhaDnaInterface.hostPricing.get(),

    allHoloFuelPendingTransactions: () => HoloFuelInterface.transactions.getAllPending(),

    allHoloFuelCompleteTransations: () => HoloFuelInterface.transactions.getAllComplete(),
  
    allHoloFuelTransations: () => HoloFuelInterface.transactions.getAll()
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
    // setHostPricing also gets passed 'units', but we don't currently use that in the dna
    updateHostPricing: (_, { pricePerUnit }) => HhaDnaInterface.hostPricing.update(pricePerUnit)
  }
}

export default resolvers