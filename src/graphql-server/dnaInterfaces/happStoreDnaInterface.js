import { createHappStoreZomeCall as createZomeCall } from '../holochainClient'

export const HyloDnaInterface = {
  currentUser: {
    get: () => createZomeCall('whoami/get_user')()
  }
}

export default HyloDnaInterface
