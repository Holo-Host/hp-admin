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
    me: async () => {
      const me = toUiData('person', await createZomeCall('hylo/people/get_me')())
      const isRegistered = await createZomeCall('hylo/people/is_registered')()
      return {
        ...me,
        isRegistered
      }
    },
    happStoreUser: () => createZomeCall('happ-store/whoami/get_user')()
  }
}

export default resolvers
