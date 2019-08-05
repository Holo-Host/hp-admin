import { connect as hcWebClientConnect } from '@holochain/hc-web-client'
import axios from 'axios'
import { get } from 'lodash/fp'
import mockCallZome from 'mock-dnas/mockCallZome'

const MOCK_DNA_CONNECTION = true || process.env.NODE_ENV === 'test'

export const HOLOCHAIN_LOGGING = true && process.env.NODE_ENV !== 'test'
let holochainClient

async function initAndGetHolochainClient () {
  if (holochainClient) return holochainClient
  try {
    holochainClient = await hcWebClientConnect({
      url: process.env.REACT_APP_DNA_INTERFACE_URL,
      wsClient: { max_reconnects: 0 }
    })
    if (HOLOCHAIN_LOGGING) {
      console.log('🎉 Successfully connected to Holochain!')
    }
  } catch (error) {
    if (this.params.logging) {
      console.log('😞 Holochain client connection failed -- ', error.toString())
    }
    throw (error)
  }
}

const axiosConfig = {
  headers: {
     'Content-Type': 'application/json',
     'Access-Control-Allow-Origin': "*"
  }
}

// const writeFile = (fileName, basedir, content) => {
//  fs.writeFile(path.join(basedir, fileName), content.replace(/\r\n/g, '\n'), { flag: 'a+' }, (err) => {
//   if (err) {
//    console.log("Error when writing the newly installed happ to mock data file. >> ERROR: ", err);
//   }
//  })
// }

export async function installHapp(app_hash) {
  if (MOCK_DNA_CONNECTION) {
    console.log("About to MOCK INSTALL the following HAPP !! : ", app_hash)

    // Call provided_happ and fetch address of happ in has
    let mockZomeCall = instanceCreateZomeCall('hha')
    const hhaAppDetails = await mockZomeCall('provider/get_app_details')({app_hash})
    console.log("hhaAppDetails", hhaAppDetails);

    if(!hhaAppDetails){return console.log("ERROR: Unable to complete MOCK CALL to `hha/provider/get_app_details`")}

    // Use address of happ in has to Fetch happ data
    mockZomeCall = instanceCreateZomeCall('happ-store')
    const HasAppDetails = await mockZomeCall('happs/get_app')({app_hash: hhaAppDetails.app_details})
    console.log(" RETURNED HasAppDetails : ", HasAppDetails)

    // Mock Install > add happ as hha hApp to mock data's installedHappList (fyi: At this point, envoy would run integrity check on dna hashes and validate dna/ui links when installing.)
    mockZomeCall = instanceCreateZomeCall('conductor')
    // Note: the below admin call is NOT a real zome call.
    await mockZomeCall('admin/install_app')({happ_hash: app_hash})

    // Confirm happ was successfully enabled
    // Note: the below admin call is NOT a real zome call.
    const installedHappList = await mockZomeCall('admin/get_installed_app_list')()
    console.log("PRINT OUT OF installedHappList : ", installedHappList)
    const happCheck = installedHappList.find(entry => entry.happ_hash === app_hash) || null

    if(installedHappList && happCheck){return true}
    else {return false}

  } else {
    console.log("About to INSTALL the following HAPP VIA ENVOY !! : ", app_hash)
    return new Promise((resolve, reject) => {
      const installHappViaEnvoy = axios.post('http://localhost:9999/holo/happs/install', {happId: app_hash}, axiosConfig)
      resolve(installHappViaEnvoy)
    })
    .catch(e=> console.log(" >>>>>>>>> Error when installing hApp via envoy! <<<<<<<<<  ERROR: ", e))
  }
}

export function createZomeCall (zomeCallPath, callOpts = {}) {
  const DEFAULT_OPTS = {
    logging: HOLOCHAIN_LOGGING,
    resultParser: null
  }
  const opts = {
    ...DEFAULT_OPTS,
    ...callOpts
  }
  return async function (args = {}) {
    try {
      const { instanceId, zome, zomeFunc } = parseZomeCallPath(zomeCallPath)
      let zomeCall

      if (MOCK_DNA_CONNECTION) {
        zomeCall = mockCallZome(instanceId, zome, zomeFunc)
      } else {
        await initAndGetHolochainClient()
        zomeCall = holochainClient.callZome(instanceId, zome, zomeFunc)
      }

      const rawResult = await zomeCall(args)
      const jsonResult = JSON.parse(rawResult)
      const error = get('Err', jsonResult) || get('SerializationError', jsonResult)
      const rawOk = get('Ok', jsonResult)

      if (error) throw (error)

      const result = opts.resultParser ? opts.resultParser(rawOk) : rawOk

      if (opts.logging) {
        const detailsFormat = 'font-weight: bold; color: rgb(220, 208, 120)'

        console.groupCollapsed(
          `👍 ${zomeCallPath}%c zome call complete`,
          'font-weight: normal; color: rgb(160, 160, 160)'
        )
        console.groupCollapsed('%cArgs', detailsFormat)
        console.log(args)
        console.groupEnd()
        console.groupCollapsed('%cResult', detailsFormat)
        console.log(result)
        console.groupEnd()
        console.groupEnd()
      }
      return result
    } catch (error) {
      console.log(
        `👎 %c${zomeCallPath}%c zome call ERROR using args: `,
        'font-weight: bold; color: rgb(220, 208, 120); color: red',
        'font-weight: normal; color: rgb(160, 160, 160)',
        args,
        ' -- ',
        error
      )
    }
  }
}

export function instanceCreateZomeCall (instanceId) {
  return (partialZomeCallPath, callOpts = {}) => {
    // regex removes leading slash
    const zomeCallPath = `${instanceId}/${partialZomeCallPath.replace(/^\/+/, '')}`
    return createZomeCall(zomeCallPath, callOpts)
  }
}

export function parseZomeCallPath (zomeCallPath) {
  const [zomeFunc, zome, instanceId] = zomeCallPath.split('/').reverse()

  return { instanceId, zome, zomeFunc }
}
