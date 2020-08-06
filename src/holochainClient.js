import { Connection as HoloWebSdkConnection } from '@holo-host/web-sdk'
import { connect as hcWebClientConnect } from '@holochain/hc-web-client'
import { get } from 'lodash/fp'
import mockCallZome from 'mock-dnas/mockCallZome'
import wait from 'waait'

export const HOSTED_HOLOFUEL_CONTEXT = !(process.env.REACT_APP_RAW_HOLOCHAIN === 'true') && process.env.REACT_APP_HOLOFUEL_APP === 'true'
export const HP_ADMIN_HOST_CONTEXT = !(process.env.REACT_APP_RAW_HOLOCHAIN === 'true')

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

export const HOLOCHAIN_LOGGING = process.env.NODE_ENV === 'development'

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
export const signPayload = async (method, request, bodyHash) => {
  const keypair = await getHpAdminKeypair()

  if (keypair === null) return ''

  const payload = { method: method.toLowerCase(), request, body: bodyHash || '' }

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

export const hashString = async (string) => {
  const dataBytes = Buffer.from(string)
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

export let holochainClient
export let wsConnection = true

let isInitiatingHcConnection = false
let wsTimeoutErrorCount = 0

async function initHolochainClient () {
  isInitiatingHcConnection = true
  let url
  try {
    if (HOSTED_HOLOFUEL_CONTEXT) {
      console.log('Inside hosted holofuel environment...')
      console.log('Establishing Holo web-sdk connection...')
      // use the web-sdk instead of hc-web-client
      const webSdkConnection = new HoloWebSdkConnection()
      await webSdkConnection.ready()
      if (HOLOCHAIN_LOGGING) {
        webSdkConnection.on('🎉 Web SDK connected and ready for Zome Calls...', console.log.bind(console))
      }

      window.webSdkConnection = webSdkConnection
      holochainClient = webSdkConnection

      wsConnection = true
      isInitiatingHcConnection = false
      return holochainClient
    } else if (HP_ADMIN_HOST_CONTEXT) {
      console.log('Inside hp-admin/host environment...')
      console.log('Establishing HPOS connection...')
      let url = process.env.NODE_ENV === 'production' ? ('wss://' + window.location.hostname + '/api/v1/ws/') : process.env.REACT_APP_DNA_INTERFACE_URL
      // construct url with query param X-Hpos-Admin-Signature = signature
      const urlObj = new URL(url)
      const params = new URLSearchParams(urlObj.search.slice(1))
      params.append('X-Hpos-Admin-Signature', await signPayload('get', urlObj.pathname))
      params.sort()
      urlObj.search = params.toString()
      url = urlObj.toString()
    } else {
      console.log('Defaulting to local holochain environment...')
      url = process.env.REACT_APP_DNA_INTERFACE_URL
    }

    // if hc-web-client connection never completes promise
    await Promise.race([
      hcWebClientConnect({
        url: url,
        timeout: 5000,
        wsClient: { max_reconnects: 2 }
      }),
      new Promise((resolve, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
    ])
      .then(hc => {
        holochainClient = hc
        if (HOLOCHAIN_LOGGING) {
          console.log('🎉 Successfully connected to Holochain!')
        }
        wsConnection = true
        isInitiatingHcConnection = false
        return holochainClient
      })
      .catch(err => {
        throw (err)
      }) 
  } catch (error) {
    if (HOLOCHAIN_LOGGING) {
      console.log('😞 Holochain client connection failed -- ', error.toString())
    }
    wsConnection = false
    isInitiatingHcConnection = false
    throw (error)
  }
}

async function initAndGetHolochainClient () {
  let counter = 0
  // This code is to avoid multiple ws connections.
  // isInitiatingHcConnection is changed in a different call of this function running in parallel
  while (isInitiatingHcConnection) {
    counter++
    await wait(1000)
    if (counter === 10) {
      isInitiatingHcConnection = false
    }
  }

  if (!wsConnection) {
    holochainClient = null
  }

  if (holochainClient === undefined) {
    wsConnection = false
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
      let jsonResult
      if (MOCK_DNA_CONNECTION && MOCK_INDIVIDUAL_DNAS[instanceId]) {
        const rawResult = await mockCallZome(instanceId, zome, zomeFunc)(args)
        jsonResult = JSON.parse(rawResult)
      } else {
        await initAndGetHolochainClient()
        if (HOSTED_HOLOFUEL_CONTEXT) {
          jsonResult = await holochainClient.zomeCall(instanceId, zome, zomeFunc, args)
        } else {
          const rawResult = await holochainClient.callZome(instanceId, zome, zomeFunc)(args)
          jsonResult = JSON.parse(rawResult)
        }
      }

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
      // if ws timeout, redirect to login page and relay connection error
      const timeout = /(timeout)/gi
      const ws = /(ws)/gi
      if (timeout.test(error) && ws.test(error)) {
        wsTimeoutErrorCount++
        if (wsTimeoutErrorCount >= 3) {
          eraseHpAdminKeypair()
          wsConnection = false
          wsTimeoutErrorCount = 0
        }
      }

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

      return { Err: error }
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
