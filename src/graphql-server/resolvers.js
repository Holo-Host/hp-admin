import HyloDnaInterface from './HyloDnaInterface'
import {
  dataMappedCall,
  toUiData
} from './dataMapping'

export const resolvers = {
  Mutation: {
    registerUser: (_, userData) => dataMappedCall('person', userData, HyloDnaInterface.currentUser.create)
  },

  Query: {
    me: async () => toUiData('person', await HyloDnaInterface.currentUser.get())
  }
}

export default resolvers
