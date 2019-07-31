import { instanceCreateZomeCall } from '../holochainClient'
import { pick } from 'lodash/fp'

export const INSTANCE_ID = 'hha'
const createZomeCall = instanceCreateZomeCall(INSTANCE_ID)

export const HhaDnaInterface = {
  currentUser: {
    create: () => createZomeCall('host/register_as_host')()
  }
}

export default HhaDnaInterface
