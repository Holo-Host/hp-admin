import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import { SchemaLink } from 'apollo-link-schema'
import schema from 'graphql-server'
import apolloLogger from 'apollo-link-logger'
import { onError } from 'apollo-link-error'
import { InMemoryCache } from 'apollo-cache-inmemory'

const mapGraphQLError = (graphQLErrors, response, { hposCheck, errorMessage }) => {
  graphQLErrors.map(({ message }) => {
    if (hposCheck && message.includes('Network Error')) {
      console.log(`[HPOS Connection Error]: ${message}`)
      response.errors.isHposConnectionActive = false
      return response
    } else if (hposCheck && message.includes(401)) {
      console.log(`[Authentication Error]: ${message}`)
      response.errors.isHposConnectionActive = true
      return response
    } else if (message.includes('Counterparty not found')) {
      console.log(`[Query Error]: ${errorMessage}, counterparty not found.`)
      return response
    }
    return response
  })
}

const errorLink = onError(({ graphQLErrors, response, operation }) => {
  if (graphQLErrors) {
    if (operation.operationName === 'HposSettingsQuery') {
      return mapGraphQLError(graphQLErrors, response, { hposCheck: true })
    } else if (operation.operationName === 'HolofuelOfferMutation') {
      const offerErrorMessage = 'Offer unsuccessful'
      return mapGraphQLError(graphQLErrors, response, { hposCheck: false, errorMessage: offerErrorMessage })
    } else if (operation.operationName === 'HolofuelRequestMutation') {
      const requestErrorMessage = 'Request unsuccessful'
      return mapGraphQLError(graphQLErrors, response, { hposCheck: false, errorMessage: requestErrorMessage })
    }
  }
})

let links = [
  new SchemaLink({ schema })
]

if (process.env.NODE_ENV !== 'test') {
  links = [apolloLogger].concat(links)
}

links = [errorLink].concat(links)

const cache = new InMemoryCache({
  typePolicies: {
    HolofuelUser: {
      keyFields: ['agentAddress', 'nickname']
    }
  }
})

const link = ApolloLink.from(links)

const apolloClient = new ApolloClient({
  link,
  cache,
  connectToDevTools: true
})

export default apolloClient
