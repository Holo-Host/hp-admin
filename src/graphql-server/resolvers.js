import HyloDnaInterface from './dnaInterfaces/hyloDnaInterface'
import HappStoreDnaInterface from './dnaInterfaces/happStoreDnaInterface'

import {
  dataMappedCall,
  toUiData
} from './dataMapping'

export const resolvers = {
  Mutation: {
    registerUser: (_, userData) => dataMappedCall('person', userData, HyloDnaInterface.currentUser.create)
  },

  Query: {
    me: async () => toUiData('person', await HyloDnaInterface.currentUser.get()),
    happStoreUser: () => HappStoreDnaInterface.currentUser.get()
  }
}

export default resolvers
