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
      // return result.map(happ => ({
      //   id: happ.address,
      //   ...pick(['title', 'thumbnailUrl', 'homepageUrl'], happ.appEntry),
      //   // this is a kludge. need to clarify how we handle multiple dnas
      //   hash: happ.appEntry.dnas[0].hash
      // }))
      return result.map(happ => {
        const mappedHapp = {
          id: happ.address,
          ...pick(['title', 'thumbnailUrl', 'homepageUrl'], happ.appEntry),
          // this is a kludge. need to clarify how we handle multiple dnas
          hash: happ.appEntry.dnas[0].hash
        }
        console.log('TCL: mappedHapp', mappedHapp)
        return mappedHapp
      })
    }
  }
}

export default resolvers
