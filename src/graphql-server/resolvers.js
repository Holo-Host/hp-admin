import * as Promise from 'bluebird'
import HyloDnaInterface from './dnaInterfaces/HyloDnaInterface'
import HappStoreDnaInterface, { getHappDetails } from './dnaInterfaces/HappStoreDnaInterface'
import HhaDnaInterface from './dnaInterfaces/HhaDnaInterface'
import EnvoyInterface from './dnaInterfaces/EnvoyInterface'

import {
  dataMappedCall,
  toUiData
} from './dataMapping'

export const resolvers = {
  Query: {
    me: async () => toUiData('person', await HyloDnaInterface.currentUser.get()),

    happStoreUser: () => HappStoreDnaInterface.currentUser.get(),

    hostingUser: () => HhaDnaInterface.currentUser.get(),

    allHapps: () => HappStoreDnaInterface.happs.all(),

    allAvailableHapps: () => Promise.map(HhaDnaInterface.happs.allAvailable(), getHappDetails),

    allHostedHapps: () => Promise.map(HhaDnaInterface.happs.allHosted(), getHappDetails),

    hostPricing: () => HhaDnaInterface.hostPricing.get()
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
