import HyloDnaInterface from './dnaInterfaces/hyloDnaInterface'
import HappStoreDnaInterface from './dnaInterfaces/happStoreDnaInterface'
import { pick } from 'lodash/fp'

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

    happStoreUser: () => HappStoreDnaInterface.currentUser.get(),

    allHapps: async () => {
      const result = await HappStoreDnaInterface.happs.all()
      return result.map(happ => ({
        id: happ.address,
        ...pick(['title', 'thumbnailUrl', 'homepageUrl'], happ.appEntry)
      }))
    }
  }
}

export default resolvers
