import * as Promise from 'bluebird'
import HyloDnaInterface from './dnaInterfaces/hyloDnaInterface'
import HappStoreDnaInterface, { getHappDetails } from './dnaInterfaces/happStoreDnaInterface'
import HhaDnaInterface from './dnaInterfaces/hhaDnaInterface'
import EnvoyInterface from './dnaInterfaces/envoyInterface'

import {
  dataMappedCall,
  toUiData
} from './dataMapping'

export const resolvers = {
  Mutation: {
    registerUser: (_, userData) => dataMappedCall('person', userData, HyloDnaInterface.currentUser.create),

    registerHostingUser: (_, hostDoc) => HhaDnaInterface.currentUser.create(hostDoc),

    enableHapp: async appId => {
      console.log('enabling happ', appId)
      const success = await EnvoyInterface.happs.install(appId)
      console.log('envoy success', success)
      if (!success) throw new Error('Failed to install app in Envoy')
      await HhaDnaInterface.happs.enable(appId)
      return true
    },

    disableHapp: (app_hash) => {
      console.log("CALLING DISABLEHAPP INSIDE of the Resolver; app_hash >> ", app_hash)
      HhaDnaInterface.happs.disable(app_hash)
    }
  },

  Query: {
    me: async () => toUiData('person', await HyloDnaInterface.currentUser.get()),

    happStoreUser: () => HappStoreDnaInterface.currentUser.get(),

    hostingUser: () => HhaDnaInterface.currentUser.get(),

    allHapps: () => HappStoreDnaInterface.happs.all(),

    allAvailableHapps: () => Promise.map(HhaDnaInterface.happs.allAvailable(), getHappDetails),

    allHostedHapps: () => Promise.map(HhaDnaInterface.happs.allHosted(), getHappDetails)
  }
}

export default resolvers
