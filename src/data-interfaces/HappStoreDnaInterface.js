import { instanceCreateZomeCall } from '../holochainClient'
import { pick } from 'lodash/fp'

export const INSTANCE_ID = 'happ-store'
const createZomeCall = instanceCreateZomeCall(INSTANCE_ID)

const HappStoreDnaInterface = {
  currentUser: {
    get: () => createZomeCall('whoami/get_user')()
  },
  happs: {
    get: id => createZomeCall('happs/get_app')({ app_hash: id })
      .then(happ => presentHapp(happ)),
    all: () => createZomeCall('happs/get_all_apps')()
      .then(happs => happs.map(presentHapp))
  }
}

export function presentHapp (happ) {
  return {
    id: happ.address,
    ...pick(['title', 'description', 'thumbnailUrl', 'homepageUrl'], happ.appEntry),
    // we currently only support a single dna
    dnaHash: happ.appEntry.dnas[0].hash
  }
}

export async function getHappDetails (happ) {
  const details = await HappStoreDnaInterface.happs.get(happ.happStoreId)
  return {
    ...happ,
    ...pick(['title', 'description', 'thumbnailUrl', 'homepageUrl', 'dnaHash'], details)
  }
}

export default HappStoreDnaInterface
