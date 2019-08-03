import axios from 'axios'
import { instanceCreateZomeCall } from '../holochainClient'
// import { pick } from 'lodash/fp'

export const INSTANCE_ID = 'hha'
const createZomeCall = instanceCreateZomeCall(INSTANCE_ID)
const axiosConfig = {
  headers: {
     'Content-Type': 'application/json',
     'Access-Control-Allow-Origin': "*"
  }
}

export const HhaDnaInterface = {
  currentUser: {
    create: (host_doc) => createZomeCall('host/register_as_host')({host_doc}),
    get: () => createZomeCall('host/is_registered_as_host')(),
  },
  happs: {
    install: (app_hash) => {
      console.log("About to install the following HAPP !! : ", app_hash)

      return new Promise((resolve, reject) => {
        const installHappViaEnvoy = axios.post('http://localhost:9999/holo/happs/install', {happId: app_hash}, axiosConfig)
        resolve(installHappViaEnvoy)
      })
      .catch(e=> console.log(" >>>>>>>>> Error when installing hApp via envoy! <<<<<<<<<  ERROR: ", e))
    },
    enable: (app_hash) => createZomeCall('host/enable_app')({app_hash}),
    allAvailable: () => createZomeCall('host/get_all_apps')()
      .then(happListings => {
        console.log("Available hApps to host in HHA_INTERFACE >>>> ", happListings);
        happListings.map(happListing => ({
        // The 'id' below is the hha-id (ie. the hash of the hApp entry into HHA).
        id: happListing.hash,
        happStoreAddress: happListing.details
      }))}
    ),
    allHosted: () => createZomeCall('host/get_enabled_app_list')()
      .then(happListings => {
        console.log("hosted hApps from HHA_INTERFACE >>>> ", happListings);
        happListings.map(happListing => ({
        // The 'id' below is the hha-id (ie. the hash of the hApp entry into HHA).
        id: happListing.happ_hash
      }))}
    ),
  }
}

export default HhaDnaInterface
