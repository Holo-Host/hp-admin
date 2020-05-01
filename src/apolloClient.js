import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import { WebSocketLink } from "apollo-link-ws"
import { SubscriptionClient } from "subscriptions-transport-ws"
import { SchemaLink } from 'apollo-link-schema'
import schema from 'graphql-server'
import apolloLogger from 'apollo-link-logger'
import { onError } from 'apollo-link-error'
import { InMemoryCache } from 'apollo-cache-inmemory'

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
      console.log(`[GraphQL Error Message]]: ${message}`)
      return response
    })
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
  const HC_CONDUCTOR = process.env.REACT_APP_DNA_INTERFACE_URL
  console.log('WS HC_CONDUCTOR : ', HC_CONDUCTOR)
  const client = new SubscriptionClient(HC_CONDUCTOR, {
    reconnect: true
  })
links = [WebSocketLink(client)].concat(links)
}

if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_RAW_HOLOCHAIN !== 'true') {
    const HPOS_SERVER = 'wss://' + window.location.hostname + '/api/v1/ws/'
    console.log('HPOS SERVER : ', HPOS_SERVER)
    const client = new SubscriptionClient(HPOS_SERVER, {
      reconnect: true
    })
  links = [WebSocketLink(client)].concat(links)
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
