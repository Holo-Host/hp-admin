import { instanceCreateZomeCall, installHapp } from '../holochainClient'

export const INSTANCE_ID = 'hha' // holo-hosting-app
const createZomeCall = instanceCreateZomeCall(INSTANCE_ID)

export const HhaDnaInterface = {
  currentUser: {
    create: (host_doc) => createZomeCall('host/register_as_host')({host_doc}),
    get: () => createZomeCall('host/is_registered_as_host')(),
  },
  happs: {
    install: (app_hash) => {
      console.log("Happ to trigger for install : ", app_hash)
      installHapp(app_hash)

      // return new Promise((resolve, reject) => {
      //   const installHappViaEnvoy = axios.post('http://localhost:9999/holo/happs/install', {happId: app_hash}, axiosConfig)
      //   resolve(installHappViaEnvoy)
      // })
      // .catch(e=> console.log(" >>>>>>>>> Error when installing hApp via envoy! <<<<<<<<<  ERROR: ", e))

    },
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
