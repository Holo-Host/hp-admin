import { instanceCreateZomeCall } from '../holochainClient'

export const INSTANCE_ID = 'hylo'
const createZomeCall = instanceCreateZomeCall(INSTANCE_ID)

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
