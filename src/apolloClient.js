import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import { SchemaLink } from 'apollo-link-schema'
import schema from 'graphql-server'
import apolloLogger from 'apollo-link-logger'
import { onError } from 'apollo-link-error'
import { InMemoryCache } from 'apollo-cache-inmemory'

const errorLink = onError(({ graphQLErrors, response, operation }) => {
  if (operation.operationName === 'HposSettings') {
    if (graphQLErrors) {
      graphQLErrors.map(({ message }) => {
        if (message.includes('Network Error')) {
          console.log(`[HPOS Connection Error]: ${message}`)
          response.errors.isHposConnectionActive = false
          return response
        } else if (message.includes(401)) {
          console.log(`[Authentication Error]: ${message}`)
          response.errors.isHposConnectionActive = true
          return response
        }
        return response
      })
    }
  }
})

let links = [
  new SchemaLink({ schema })
]

if (process.env.REACT_APP_HOLOFUEL_APP !== 'true') {
  links = [errorLink].concat(links)
}

if (process.env.NODE_ENV !== 'test') {
  links = [apolloLogger].concat(links)
}

const cache = new InMemoryCache({
  typePolicies: {
    TxHolofuelUser: {
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
