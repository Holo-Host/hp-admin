import { createZomeCall } from './holochainClient'

import {
  dataMappedCall,
  toUiData
} from './dataMapping'

export const resolvers = {
  Mutation: {
    registerUser: (_, userData) => dataMappedCall('person', userData, createZomeCall('hylo/people/register_user'))
  },

  Query: {
    me: async () => toUiData('person', await createZomeCall('hylo/people/get_me')()),
    happStoreUser: () => createZomeCall('happ-store/whoami/get_user')()
  }
}

export default resolvers
