import { connect as hcWebClientConnect } from '@holochain/hc-web-client'
import { get } from 'lodash/fp'
import mockCallZome from 'mock-dnas/mockCallZome'
import { findInstanceForAgent } from 'utils/integration-testing/conductorConfig'

const developmentMockDnaConnection = false // this is the value MOCK_DNA_CONNECTION will have in the dev server
// This can be written as a boolean expression then it's even less readable
export const MOCK_DNA_CONNECTION = process.env.REACT_APP_INTEGRATION_TEST
  ? false
  : process.env.NODE_ENV === 'test'
    ? true
    : developmentMockDnaConnection

// These are overwritten when MOCK_DNA_CONNECTION is true, so they only take effect when that is false
export const MOCK_INDIVIDUAL_DNAS = {
  hylo: true,
  'happ-store': true,
  hha: true,
  holofuel: false
}
// export const MOCK_HP_CONNECTION = true || process.env.NODE_ENV === 'test'

export const HOLOCHAIN_LOGGING = true && process.env.NODE_ENV !== 'test'
let holochainClient

export function conductorInstanceId (instanceId, agentIndex) {
  const realInstanceId = instanceId => findInstanceForAgent(instanceId, agentIndex).id

  // TODO: name holo-hosting-app hha in nix setup, then we can get rid of this dictionary lookup
  return realInstanceId({
    hylo: 'hylo',
    'happ-store': 'happ-store',
    hha: 'holo-hosting-app',
    holofuel: 'holofuel'
  }[instanceId])
}

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
    return holochainClient
  } catch (error) {
    if (HOLOCHAIN_LOGGING) {
      console.log('😞 Holochain client connection failed -- ', error.toString())
    }
    throw (error)
  }
}

export function createZomeCall (zomeCallPath, agentIndex = 0, callOpts = {}) {
  const DEFAULT_OPTS = {
    logging: HOLOCHAIN_LOGGING,
    resultParser: null
  }
  const opts = {
    ...DEFAULT_OPTS,
    ...callOpts
  }

  const prevErr = []

  return async function (args = {}) {
    try {
      const { instanceId, zome, zomeFunc } = parseZomeCallPath(zomeCallPath)
      let zomeCall

      if (MOCK_DNA_CONNECTION || MOCK_INDIVIDUAL_DNAS[instanceId]) {
        zomeCall = mockCallZome(instanceId, zome, zomeFunc)
      } else {
        await initAndGetHolochainClient()
        const realInstanceId = conductorInstanceId(instanceId, agentIndex)
        zomeCall = holochainClient.callZome(realInstanceId, zome, zomeFunc)
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
      const repeatingError = prevErr.find(e => e.path === zomeCallPath && e.error === error)
      if (repeatingError) return null
      else if (process.env.REACT_APP_INTEGRATION_TEST) {
        prevErr.push({
          error: error.message,
          path: zomeCallPath
        })
        console.log(prevErr)
      } else {
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
}

export function instanceCreateZomeCall (instanceId, agentIndex) {
  return (partialZomeCallPath, callOpts = {}) => {
    // regex removes leading slash
    const zomeCallPath = `${instanceId}/${partialZomeCallPath.replace(/^\/+/, '')}`
    return createZomeCall(zomeCallPath, agentIndex, callOpts)
  }
}

export function parseZomeCallPath (zomeCallPath) {
  const [zomeFunc, zome, instanceId] = zomeCallPath.split('/').reverse()

  return { instanceId, zome, zomeFunc }
}
