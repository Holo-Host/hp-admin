import { instanceCreateZomeCall } from '../holochainClient'

export const INSTANCE_ID = 'hha' // holo-hosting-app
const createZomeCall = instanceCreateZomeCall(INSTANCE_ID)

const HhaDnaInterface = {
  currentUser: {
    // create is getting passed a variable (hostDoc) but is currently ignoring it
    create: async () => {
      const result = await createZomeCall('host/register_as_host')({ kyc_proof: 'this value is ignored by dna' })
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
    enable: (app_hash) => createZomeCall('host/enable_app')({app_hash}),
    disable: (app_hash) => console.log("We need to plug in disableHapp and disable this app : ", app_hash),
    allAvailable: () => createZomeCall('host/get_all_apps')()
      .then(happListings => happListings.map(happListing => ({
        // The 'id' below is the hha-id (ie. the hash of the hApp entry into HHA).
        id: happListing.hash,
        happStoreAddress: happListing.details
      }))
    ),
    allHosted: () => createZomeCall('host/get_enabled_app_list')()
      .then(hostedHapps => hostedHapps.map(hostedHapp => ({
        // The 'id' below is the hha-id (ie. the hash of the hApp entry into HHA).
        id: hostedHapp.happ_hash
      }))
    ),
  }
}

export default HhaDnaInterface
