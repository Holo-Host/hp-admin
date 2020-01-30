import { connect as hcWebClientConnect } from '@holochain/hc-web-client'
import { get } from 'lodash/fp'
import mockCallZome from 'mock-dnas/mockCallZome'
import stringify from 'json-stable-stringify'
import wait from 'waait'

// This can be written as a boolean expression then it's even less readable
export const MOCK_DNA_CONNECTION = process.env.REACT_APP_INTEGRATION_TEST
  ? false
  : process.env.NODE_ENV === 'test'
    ? true
    : process.env.REACT_APP_MOCK_DNA_CONNECTION === 'true' || false

// These are overwritten when MOCK_DNA_CONNECTION is true, so they only take effect when that is false
export const MOCK_INDIVIDUAL_DNAS = {
  hylo: true,
  'happ-store': true,
  hha: true,
  holofuel: true
}

export const HOLOCHAIN_LOGGING = true && process.env.NODE_ENV !== 'test'

// Parse window.location to retrieve holoPort's HC public key (3rd level subdomain in URL)
const getHcPubkey = () => {
  return ((process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')
    ? '5m5srup6m3b2iilrsqmxu6ydp8p8cr0rdbh4wamupk3s4sxqr5'
    : window.location.hostname.split('.')[0])
}

// This import has to be async because of the way that dumb webpack interacts with wasm
// It took me more than 2 days to make it work so DO NOT even try to touch this code!
const importHpAdminKeypairClass = async () => {
  const wasm = await import('@holo-host/hp-admin-keypair')
  return wasm.HpAdminKeypair
}

let HpAdminKeypairInstance

// Erase keypair
export const eraseHpAdminKeypair = () => {
  HpAdminKeypairInstance = undefined
}

// Create keypair using wasm-based HpAdminKeypair Class
// Use singleton pattern
// Return null when no params provided
export const getHpAdminKeypair = async (email = undefined, password = undefined) => {
  if (HpAdminKeypairInstance) return HpAdminKeypairInstance
  try {
    const hcKey = getHcPubkey()
    if (!hcKey || !email || !password) return null

    const HpAdminKeypair = await importHpAdminKeypairClass()
    HpAdminKeypairInstance = new HpAdminKeypair(hcKey, email, password)

    if (HOLOCHAIN_LOGGING) {
      console.log('🎉 Successfully created HP Admin KeyPair!')
    }

    return HpAdminKeypairInstance
  } catch (error) {
    if (HOLOCHAIN_LOGGING) {
      console.log('😞 Failed to create HP Admin KeyPair! -- ', error.toString())
    }
    throw (error)
  }
}

// Return empty string if HpAdminKeypair is still not initialized
export const signPayload = async (method, request, body) => {
  const keypair = await getHpAdminKeypair()

  if (keypair === null) return ''

  const payload = { method: method.toLowerCase(), request, body: stringify(body) || '' }

  try {
    if (HOLOCHAIN_LOGGING) {
      console.log('🎉 Signing payload: ', payload)
    }

    const signature = keypair.sign(payload)

    if (HOLOCHAIN_LOGGING) {
      console.log('🎉 Successfully signed payload with signature ', signature)
    }

    return signature
  } catch (error) {
    if (HOLOCHAIN_LOGGING) {
      console.log('😞 Failed to sign payload -- ', error.toString())
    }
    throw (error)
  }
}

export const hashResponseBody = async (data) => {
  const dataBytes = Buffer.from(stringify(data))
  const hashBytes = await crypto.subtle.digest('SHA-512', dataBytes)

  return Buffer.from(hashBytes).toString('base64')
}

export function conductorInstanceIdbyDnaAlias (instanceId) {
  return {
    hylo: 'hylo',
    'happ-store': 'happ-store',
    hha: 'holo-hosting-app',
    holofuel: 'holofuel'
  }[instanceId]
}

let holochainClient
let isInitiatingHcConnection = false

async function initHolochainClient () {
  isInitiatingHcConnection = true
  try {
    let url = process.env.NODE_ENV === 'production' ? ('wss://' + window.location.hostname + '/api/v1/ws/') : process.env.REACT_APP_DNA_INTERFACE_URL
    // Construct url with query param X-Hpos-Admin-Signature = signature
    const urlObj = new URL(url)
    const params = new URLSearchParams(urlObj.search.slice(1))
    params.append('X-Hpos-Admin-Signature', await signPayload('get', urlObj.pathname))
    params.sort()
    urlObj.search = params.toString()
    url = urlObj.toString()

    holochainClient = await hcWebClientConnect({
      url: url,
      wsClient: { max_reconnects: 0 }
    })
    if (HOLOCHAIN_LOGGING) {
      console.log('🎉 Successfully connected to Holochain!')
    }
    isInitiatingHcConnection = false
    return holochainClient
  } catch (error) {
    if (HOLOCHAIN_LOGGING) {
      console.log('😞 Holochain client connection failed -- ', error.toString())
    }
    isInitiatingHcConnection = false
    throw (error)
  }
}
async function initAndGetHolochainClient () {
  let counter = 0
  // This code is to let avoid multiple ws connections.
  // isInitiatingHcConnection is changed in a different call of this function running in parallel
  while (isInitiatingHcConnection) {
    counter++
    await wait(100)
    if (counter === 10) {
      isInitiatingHcConnection = false
    }
  }
  if (holochainClient) return holochainClient
  else return initHolochainClient()
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

  const prevErr = []

  return async function (args = {}) {
    try {
      const { instanceId, zome, zomeFunc } = parseZomeCallPath(zomeCallPath)
      let zomeCall
      if (MOCK_DNA_CONNECTION && MOCK_INDIVIDUAL_DNAS[instanceId]) {
        zomeCall = mockCallZome(instanceId, zome, zomeFunc)
      } else {
        await initAndGetHolochainClient()
        const dnaAliasInstanceId = conductorInstanceIdbyDnaAlias(instanceId)
        zomeCall = holochainClient.callZome(dnaAliasInstanceId, zome, zomeFunc)
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
