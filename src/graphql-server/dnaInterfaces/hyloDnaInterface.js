import { createHyloZomeCall as createZomeCall } from '../holochainClient'

export const HyloDnaInterface = {
  currentUser: {
    create: async user => ({
      ...await createZomeCall('people/register_user')(user),
      isRegistered: true
    }),

    get: async () => ({
      ...await createZomeCall('people/get_me')(),
      isRegistered: await createZomeCall('people/is_registered')()
    })
  }
}

export default HyloDnaInterface
