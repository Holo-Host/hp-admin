import { connect as hcWebClientConnect } from '@holochain/hc-web-client'
import { get } from 'lodash/fp'

export const HOLOCHAIN_LOGGING = true
const DNA_INSTANCE_ID = 'hylo'
let holochainClient

async function initAndGetHolochainClient () {
  if (holochainClient) return holochainClient
  try {
    holochainClient = await hcWebClientConnect({
      url: process.env.HOLOCHAIN_BUILD
        ? null
        : process.env.REACT_APP_HOLOCHAIN_WEBSOCKET_URI,
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

export function createZomeCall (zomeCallPath, callOpts = {}) {
  const DEFAULT_OPTS = {
    dnaInstanceId: DNA_INSTANCE_ID,
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
      const zomeCall = holochainClient.callZome(opts.dnaInstanceId, zome, zomeFunc)
      const rawResult = await zomeCall(args)
      const jsonResult = JSON.parse(rawResult)
      const error = get('Err', jsonResult) || get('SerializationError', jsonResult)
      const rawOk = get('Ok', jsonResult)

      if (error) throw (error)

      const result = opts.resultParser ? opts.resultParser(rawOk) : rawOk

      if (opts.logging) {
        const detailsFormat = 'font-weight: bold; color: rgb(220, 208, 120)'

        console.groupCollapsed(
          `👍 ${opts.dnaInstanceId}/${zomeCallPath}%c zome call complete`,
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
        `👎 %c${opts.dnaInstanceId}/${zomeCallPath}%c zome call ERROR using args: `,
        'font-weight: bold; color: rgb(220, 208, 120); color: red',
        'font-weight: normal; color: rgb(160, 160, 160)',
        args,
        ' -- ',
        error
      )
    }
  }
}

export function parseZomeCallPath (zomeCallPath) {
  const [zomeFunc, zome, dnaInstanceId] = zomeCallPath.split('/').reverse()

  return { dnaInstanceId, zome, zomeFunc }
}
