import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import { RetryLink } from 'apollo-link-retry'
// NOTE: CANNOT USE THE SHIPPED WebSocketLink by "apollo-link-ws" module,
// as the "subscriptions-transport-ws" requires that the server be a GraphQL server>>
//   for more info : https://github.com/apollographql/subscriptions-transport-ws/blob/master/src/client.ts#L657
// import { WebSocketLink } from "apollo-link-ws"
// import { SubscriptionClient } from "subscriptions-transport-ws"
import { connect } from '@holochain/hc-web-client'
import { SchemaLink } from 'apollo-link-schema'
import schema from 'graphql-server'
import apolloLogger from 'apollo-link-logger'
import { onError } from 'apollo-link-error'
import { InMemoryCache } from 'apollo-cache-inmemory'
// import { signPayload } from "./holochainClient"

const errorLink = onError(({ graphQLErrors, networkError, response }) => {
  if (networkError) {
    console.log(`[Network error]: ${networkError}`)
    response.errors.isHposConnectionActive = false
    return response
  }

  if (graphQLErrors) {
    graphQLErrors.map(({ message }) => {
      if (message.includes(401)) {
        console.log(`[Authentication Error]: ${message}`)
        response.errors.isHposConnectionActive = true
        return response
      }
      if (message.includes('Network Error')) {
        console.log(`[HPOS Connection Error]: ${message}`)
        response.errors.isHposConnectionActive = false
        return response
      }

      console.log(`[GraphQL Error Message]: ${message}`)
      return response
    })
  }
})

// const getSignedPayload = async(urlObj) => {
//   const signedPayload = await signPayload('get', urlObj.pathname)
//   console.log('SIGNED PAYLOAD >>> Inside getSignedPayload : ', signedPayload)
//   return signedPayload
// }

const hcWsLink = hcWebClientParams => new ApolloLink(async(operation) => {
  console.log("is operation hpos api? ", hcWebClientParams)
  console.log(' operation : ', operation)

    // If no 401 error (ie: signed in), do the following:
      // const urlObj = new URL(hcWebClientParams.url)
      // const params = new URLSearchParams(urlObj.search.slice(1))
      // const signedPayload = getSignedPayload(urlObj)
      // console.log('signedPayload : ', signedPayload)
      // params.append('X-Hpos-Admin-Signature', signedPayload)
      // params.sort()
      // urlObj.search = params.toString()
      // const SIGNED_HPOS_SERVER_URL = urlObj.toString()
      // console.log('WS SIGNED_HPOS_SERVER_URL : ', SIGNED_HPOS_SERVER_URL)
      // hcWebClientParams.url = SIGNED_HPOS_SERVER_URL


  let hcWebClient
  try {
    hcWebClient = await connect(hcWebClientParams)
    const observer = await hcWebClient.callZome('holofuel', 'transactions', 'ledger_state')(operation.variables)
    console.log(' HOLOCHAIN WEBSOCKET Link Observer : ', observer)
    return observer
  } catch (error) {
    console.error('Error when creating connection with hc client', error)
  }
})

const reportErrors = errorCallback => new ApolloLink((operation, forward) => {
  const observer = forward(operation);
  // errors will be sent to the errorCallback
  observer.subscribe({ error: errorCallback })
  return observer
})

let links = [
  new SchemaLink({ schema }),
  reportErrors(console.error)
]

if (process.env.REACT_APP_HOLOFUEL_APP !== 'true') {
  links = [errorLink].concat(links)
} else if (process.env.REACT_APP_HOLOFUEL_APP === 'true' && process.env.NODE_ENV !== 'test') {
  const HC_CONDUCTOR_URL = process.env.REACT_APP_DNA_INTERFACE_URL
  console.log('WS HC_CONDUCTOR_URL : ', HC_CONDUCTOR_URL)
  const hcWebClient = {
    url: HC_CONDUCTOR_URL,
    timeout: 1000,
    wsClient: { max_reconnects: 0 }
  }
  links = [hcWsLink(hcWebClient)].concat(links)
}

if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_RAW_HOLOCHAIN !== 'true') {
    const HPOS_SERVER = 'wss://' + window.location.hostname + '/api/v1/ws/'
    console.log('HPOS SERVER : ', HPOS_SERVER)

    const hcWebClient = {
      url: HPOS_SERVER,
      timeout: 1000,
      wsClient: { max_reconnects: 0 }
    }

    const newLink = new RetryLink().split(
      operation => {
        const hposCall = /(Hpos)/g
        console.log('! hpos match ? : ', !hposCall.test(operation.operationName))
        return !hposCall.test(operation.operationName)
      },
      hcWsLink(hcWebClient)
    )
    links = [newLink].concat(links)
}

if (process.env.NODE_ENV !== 'test') {
  links = [apolloLogger].concat(links)
}

const link = ApolloLink.from(links)

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true
})

export default apolloClient
