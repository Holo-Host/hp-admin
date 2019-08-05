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

    registerHostingUser: (host_doc) => HhaDnaInterface.currentUser.create(host_doc),

    enableHapp: (app_hash) => HhaDnaInterface.happs.install(app_hash),
    // async
    // {
    //   console.log("CALLING ENABLEHAPP INSIDE of the Reducer; app_hash >> ", app_hash)
    //   const installedHapp = await HhaDnaInterface.happs.install(app_hash)
    //   console.log(" !! installedHapp !! > ", installedHapp)
    //   // const enabledHapp = HhaDnaInterface.happs.enable({app_hash})
    //   // console.log(" !! enabledHapp !! > ", enabledHapp);
    //   return installedHapp // enableHapp
    // },

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

    allAvailableHapps: () => HhaDnaInterface.happs.allAvailable(),

    allHostedHapps: () => HhaDnaInterface.happs.allHosted()
  }
}

export default resolvers
