import HyloDnaInterface from './dnaInterfaces/hyloDnaInterface'
import HappStoreDnaInterface from './dnaInterfaces/happStoreDnaInterface'
import HhaDnaInterface from './dnaInterfaces/hhaDnaInterface'

import {
  dataMappedCall,
  toUiData
} from './dataMapping'

export const resolvers = {
  Mutation: {
    registerUser: (_, userData) => dataMappedCall('person', userData, HyloDnaInterface.currentUser.create),

    registerHostingUser: ({ host_doc }) => HhaDnaInterface.currentUser.create(host_doc),

    enableHapp: async ({ app_hash }) => {
      await HhaDnaInterface.happs.install(app_hash);
      await HhaDnaInterface.happs.enable(app_hash)
    }
  },

  Query: {
    me: async () => toUiData('person', await HyloDnaInterface.currentUser.get()),

    happStoreUser: () => HappStoreDnaInterface.currentUser.get(),

    hostingUser: () => HhaDnaInterface.currentUser.get(),

    allHapps: () => HappStoreDnaInterface.happs.all(),

    allAvailableHapps: () => HhaDnaInterface.happs.allAvailable(),

    allHostedHapps: () => HhaDnaInterface.happs.allHosted()
  }
}

export default resolvers

// axios.post('http://localhost:9999/holo/happs/install', postData, axiosConfig)
