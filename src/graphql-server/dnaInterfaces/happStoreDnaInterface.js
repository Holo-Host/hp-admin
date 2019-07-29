import { instanceCreateZomeCall } from '../holochainClient'

export const INSTANCE_ID = 'happ-store'
const createZomeCall = instanceCreateZomeCall(INSTANCE_ID)

export const HappStoreDnaInterface = {
  currentUser: {
    get: () => createZomeCall('whoami/get_user')()
  },
  happs: {
    all: () => createZomeCall('happs/get_all_apps')()
  }
}

export default HappStoreDnaInterface
