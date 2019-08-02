import { instanceCreateZomeCall } from '../holochainClient'
import { pick } from 'lodash/fp'

export const INSTANCE_ID = 'happ-store'
const createZomeCall = instanceCreateZomeCall(INSTANCE_ID)

export const HappStoreDnaInterface = {
  currentUser: {
    get: () => createZomeCall('whoami/get_user')()
  },
  happs: {
    all: () => createZomeCall('happs/get_all_apps')()
      .then(happs => happs.map(happ => ({
        id: happ.address,
        ...pick(['title', 'thumbnailUrl', 'homepageUrl'], happ.appEntry),
        // this is a kludge. need to clarify how we handle multiple dnas
        hash: happ.appEntry.dnas[0].hash

        // TODO: We need to create an array of DNAs that includes reference to both their hash and handle.
        // The following proposes having an array of obj, wherein each obj represents a DNA which includes information about the handle, hash, and (potentially version).
        // dna: [
        //   {happ.appEntry.dnas[0].handle: { hash: happ.appEntry.dnas[0].hash }},
        //   {happ.appEntry.dnas[0].handle: { hash: happ.appEntry.dnas[1].hash }}
        // ]

        // TODO: We might also wish to include ui references, when available in the happ...
        // ui: happ.appEntry.ui.handle (ie. The handle/name of the UI)
      })))
  }
}

export default HappStoreDnaInterface
