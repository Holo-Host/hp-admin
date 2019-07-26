import { connect as hcWebClientConnect } from '@holochain/hc-web-client'
import { get } from 'lodash/fp'
import { HYLO_INSTANCE_ID, HAPP_STORE_INSTANCE_ID } from 'config/dnaconfig'
import mockCallZome from 'mock-dnas/mockCallZome'

const MOCK_DNA_CONNECTION = false

export const HOLOCHAIN_LOGGING = true
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

// this is a bad name. If anyone has something better, please fix it.
export const createCreateZomeCall = instanceId => (zomeCallPath, callOpts = {}) => {
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
      await initAndGetHolochainClient()

      const { zome, zomeFunc } = parseZomeCallPath(zomeCallPath)

      const zomeCall = MOCK_DNA_CONNECTION
        ? mockCallZome(instanceId, zome, zomeFunc)
        : holochainClient.callZome(instanceId, zome, zomeFunc)

      const rawResult = await zomeCall(args)
      const jsonResult = JSON.parse(rawResult)
      const error = get('Err', jsonResult) || get('SerializationError', jsonResult)
      const rawOk = get('Ok', jsonResult)

      if (error) throw (error)

      const result = opts.resultParser ? opts.resultParser(rawOk) : rawOk

      if (opts.logging) {
        const detailsFormat = 'font-weight: bold; color: rgb(220, 208, 120)'

        console.groupCollapsed(
          `👍 ${instanceId}/${zomeCallPath}%c zome call complete`,
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
        `👎 %c${instanceId}/${zomeCallPath}%c zome call ERROR using args: `,
        'font-weight: bold; color: rgb(220, 208, 120); color: red',
        'font-weight: normal; color: rgb(160, 160, 160)',
        args,
        ' -- ',
        error
      )
    }
  }
}

export const createHyloZomeCall = createCreateZomeCall(HYLO_INSTANCE_ID)

export const createHappStoreZomeCall = createCreateZomeCall(HAPP_STORE_INSTANCE_ID)

export function parseZomeCallPath (zomeCallPath) {
  const [zomeFunc, zome, instanceId] = zomeCallPath.split('/').reverse()

  return { instanceId, zome, zomeFunc }
}
