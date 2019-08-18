import * as Promise from 'bluebird'
import HyloDnaInterface from './dnaInterfaces/hyloDnaInterface'
import HappStoreDnaInterface, { getHappDetails } from './dnaInterfaces/happStoreDnaInterface'
import HhaDnaInterface from './dnaInterfaces/hhaDnaInterface'
import EnvoyInterface from './nonHcInterfaces/envoyInterface'
import HoloPortInterface from './nonHcInterfaces/holoportInterface'
import HoloFuelInterface from './dnaInterfaces/holofuelDnaInterface'

import {
  dataMappedCall,
  toUiData
} from './dataMapping'

export const resolvers = {
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

    updateHPSettings: async (_, HPSettings) => {
      console.log('calling updateHPSettings; data passed : ', HPSettings)
      const newHPSettingsReply = await HoloPortInterface.deviceSettings.update(HPSettings.newHPSettings)
      console.log('CHECKING:>> ',newHPSettingsReply);
      return newHPSettingsReply
    },

    toggleSshAccess: () => HoloPortInterface.deviceSettings.updateSSH(),

    factoryReset: () => HoloPortInterface.deviceSettings.factoryReset()
  },

  Query: {
    me: async () => toUiData('person', await HyloDnaInterface.currentUser.get()),

    happStoreUser: () => HappStoreDnaInterface.currentUser.get(),

    hostingUser: () => HhaDnaInterface.currentUser.get(),

    allHapps: () => HappStoreDnaInterface.happs.all(),

    allAvailableHapps: () => Promise.map(HhaDnaInterface.happs.allAvailable(), getHappDetails),

    allHostedHapps: () => Promise.map(HhaDnaInterface.happs.allHosted(), getHappDetails),

    allHPSettings: () => {
      const value = HoloPortInterface.deviceSettings.all()
      console.log('Checking: Value', value)
      return value
    },

    hpTermsOfService: () => HoloPortInterface.deviceSettings.tos(),

    allHoloFuelPendingTransaction: () => HoloFuelInterface.transactions.getAllPending(),

    allHoloFuelCompleteTransations: () => HoloFuelInterface.transactions.getAllComplete(),
  
    allHoloFuelTransations: () => HoloFuelInterface.transactions.getAll()
  }
}

export default resolvers