import { createHappStoreZomeCall as createZomeCall } from '../holochainClient'

export const HappStoreInterface = {
  currentUser: {
    get: () => createZomeCall('whoami/get_user')()
  },
  happs: {
    all: () => createZomeCall('happs/get_all_apps')()
  }
}

export default HappStoreInterface
