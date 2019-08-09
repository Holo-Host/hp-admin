import { instanceCreateZomeCall } from '../holochainClient'

export const INSTANCE_ID = 'hha' // holo-hosting-app
const createZomeCall = instanceCreateZomeCall(INSTANCE_ID)

const HhaDnaInterface = {
  currentUser: {
    // create is getting passed a variable (hostDoc) but is currently ignoring it
    create: async () => {
      const result = await createZomeCall('host/register_as_host')({ host_doc: { kyc_proof: 'this value is ignored by dna' } })
      return {
        id: result
      }
    },
    get: async () => {
      const { links } = await createZomeCall('host/is_registered_as_host')()
      if (links.length === 0) {
        return null
      } else {
        return {
          id: links[0].address
        }
      }
    }
  },
  happs: {
    get: appId => createZomeCall('provider/get_app_details')({ app_hash: appId })
      .then(happ => ({
        id: appId,
        happStoreAddress: happ.app_bundle.happ_hash
      })),
    enable: appId => createZomeCall('host/enable_app')({ app_hash: appId }),
    disable: appId => createZomeCall('host/disable_app')({ app_hash: appId }),
    allAvailable: () => createZomeCall('host/get_all_apps')()
      .then(happListings => happListings.map(({ hash, details }) => {
        const { Ok: { app_bundle: { happ_hash: happStoreAddress } } } = JSON.parse(details)
        return {
        // The 'id' below is the hha-id (ie. the hash of the hApp entry into HHA).
          id: hash,
          happStoreAddress
        }
      })),

    allHosted: () => createZomeCall('host/get_enabled_app_list')()
      .then(hostedHapps => hostedHapps.map(({ address, entry: { happ_hash: happStoreAddress } }) => ({
        // The 'id' below is the hha-id (ie. the hash of the hApp entry into HHA).
        id: address,
        happStoreAddress,
        isEnabled: true
      })))
  }
}

export default HhaDnaInterface
