import { createZomeCall } from './holochainClient'

export const HyloDnaInterface = {
  currentUser: {
    create: async user => {
      return {
        ...await createZomeCall('people/register_user')(user),
        isRegistered: true
      }
    },

    get: async () => {
      return {
        ...await createZomeCall('people/get_me')(),
        isRegistered: await createZomeCall('people/is_registered')()
      }
    }
  }
}

export default HyloDnaInterface
