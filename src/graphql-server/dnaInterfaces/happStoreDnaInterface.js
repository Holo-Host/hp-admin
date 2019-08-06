import { instanceCreateZomeCall } from '../holochainClient'
import { pick } from 'lodash/fp'

export const INSTANCE_ID = 'happ-store'
const createZomeCall = instanceCreateZomeCall(INSTANCE_ID)

export const HappStoreDnaInterface = {
  currentUser: {
    get: () => createZomeCall('whoami/get_user')()
  },
  happs: {
    get: id => createZomeCall('happs/get_app')(id)
      .then(happ => presentHapp(happ)),
    all: () => createZomeCall('happs/get_all_apps')()
      .then(happs => happs.map(presentHapp))
  }
}

export function presentHapp (happ) {
  return {
    id: happ.address,
    ...pick(['title', 'thumbnailUrl', 'homepageUrl'], happ.appEntry),
    // this is a kludge. need to clarify how we handle multiple dnas
    hash: happ.appEntry.dnas[0].hash
  }
}

export async function getHappDetails (happ) {
  const details = await HappStoreDnaInterface.happs.get(happ.happStoreAddress)
  return {
    ...happ,
    ...pick(['title', 'thumbnailUrl', 'homepageUrl', 'hash'], details)
  }
}

export default HappStoreDnaInterface
