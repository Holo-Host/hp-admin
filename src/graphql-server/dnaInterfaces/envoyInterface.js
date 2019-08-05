import axios from 'axios'
import { MOCK_DNA_CONNECTION } from '../holochainClient'

const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
}

export async function installHapp (appHash) {
  console.log('installingHapp', appHash)
  if (MOCK_DNA_CONNECTION) {
  } else {
    console.log("About to INSTALL the following HAPP VIA ENVOY !! : ", app_hash)
    return new Promise((resolve, reject) => {
      const installHappViaEnvoy = axios.post('http://localhost:9999/holo/happs/install', {happId: app_hash}, axiosConfig)
      resolve(installHappViaEnvoy)
    })
    .catch(e=> console.log(" >>>>>>>>> Error when installing hApp via envoy! <<<<<<<<<  ERROR: ", e))
  }
}

// export async function installHapp (app_hash) {
//   if (MOCK_DNA_CONNECTION) {
//     console.log("About to MOCK INSTALL the following HAPP !! : ", app_hash)

//     // Call provided_happ and fetch address of happ in has
//     let mockZomeCall = instanceCreateZomeCall('hha')
//     const hhaAppDetails = await mockZomeCall('provider/get_app_details')({app_hash})
//     console.log("hhaAppDetails", hhaAppDetails);

//     if(!hhaAppDetails){return console.log("ERROR: Unable to complete MOCK CALL to `hha/provider/get_app_details`")}

//     // Use address of happ in has to Fetch happ data
//     mockZomeCall = instanceCreateZomeCall('happ-store')
//     const HasAppDetails = await mockZomeCall('happs/get_app')({app_hash: hhaAppDetails.app_details})
//     console.log(" RETURNED HasAppDetails : ", HasAppDetails)

//     // Mock Install > add happ as hha hApp to mock data's installedHappList (fyi: At this point, envoy would run integrity check on dna hashes and validate dna/ui links when installing.)
//     mockZomeCall = instanceCreateZomeCall('conductor')
//     // Note: the below admin call is NOT a real zome call.
//     await mockZomeCall('admin/install_app')({happ_hash: app_hash})

//     // Confirm happ was successfully enabled
//     // Note: the below admin call is NOT a real zome call.
//     const installedHappList = await mockZomeCall('admin/get_installed_app_list')()
//     console.log("PRINT OUT OF installedHappList : ", installedHappList)
//     const happCheck = installedHappList.find(entry => entry.happ_hash === app_hash) || null

//     if(installedHappList && happCheck){return true}
//     else {return false}

//   } else {
//     console.log("About to INSTALL the following HAPP VIA ENVOY !! : ", app_hash)
//     return new Promise((resolve, reject) => {
//       const installHappViaEnvoy = axios.post('http://localhost:9999/holo/happs/install', {happId: app_hash}, axiosConfig)
//       resolve(installHappViaEnvoy)
//     })
//     .catch(e=> console.log(" >>>>>>>>> Error when installing hApp via envoy! <<<<<<<<<  ERROR: ", e))
//   }
// }
