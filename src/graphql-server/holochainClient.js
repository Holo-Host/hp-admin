import { connect as hcWebClientConnect } from '@holochain/hc-web-client'
import { get } from 'lodash/fp'
import { HYLO_INSTANCE_ID, HAPP_STORE_INSTACE_ID } from 'config/dnaconfig'

export const HOLOCHAIN_LOGGING = true
const holochainClients = {}

async function initAndGetHolochainClient (instanceId) {
  if (holochainClients[instanceId]) return holochainClients[instanceId]
  try {
    holochainClients[instanceId] = await hcWebClientConnect({
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
    instanceId,
    logging: HOLOCHAIN_LOGGING,
    resultParser: null
  }
  const opts = {
    ...DEFAULT_OPTS,
    ...callOpts
  }
  return async function (args = {}) {
    try {
      await initAndGetHolochainClient(instanceId)

      const { zome, zomeFunc } = parseZomeCallPath(zomeCallPath)
      const zomeCall = holochainClients[instanceId].callZome(opts.instanceId, zome, zomeFunc)
      const rawResult = await zomeCall(args)
      const jsonResult = JSON.parse(rawResult)
      const error = get('Err', jsonResult) || get('SerializationError', jsonResult)
      const rawOk = get('Ok', jsonResult)

      if (error) throw (error)

      const result = opts.resultParser ? opts.resultParser(rawOk) : rawOk

      if (opts.logging) {
        const detailsFormat = 'font-weight: bold; color: rgb(220, 208, 120)'

        console.groupCollapsed(
          `👍 ${opts.instanceId}/${zomeCallPath}%c zome call complete`,
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
        `👎 %c${opts.instanceId}/${zomeCallPath}%c zome call ERROR using args: `,
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

export const createHappStoreZomeCall = createCreateZomeCall(HAPP_STORE_INSTACE_ID)

export function parseZomeCallPath (zomeCallPath) {
  const [zomeFunc, zome, instanceId] = zomeCallPath.split('/').reverse()

  return { instanceId, zome, zomeFunc }
}
