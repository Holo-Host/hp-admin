import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import apolloLogger from 'apollo-link-logger'
import { SchemaLink } from 'apollo-link-schema'
import { onError } from 'apollo-link-error'
import { InMemoryCache } from 'apollo-cache-inmemory'
import schema from 'graphql-server'
import { setConnection } from 'contexts/useConnectionContext'

const errorLink = onError(({ graphQLErrors, networkError, response }) => {
  if (networkError) {
    console.log(`[Network error]: ${networkError}`)
    response.errors.hposConnection = false
    return setConnection({ hposConnection: false })
  }

  if (graphQLErrors) {
    graphQLErrors.map(({ message }) => {
      if (message.includes(401)) {
        console.log(`[Authentication Error]: ${message}`)
        response.errors.hposConnection = true
        return setConnection({ hposConnection: true })
      }
      if (message.includes('Network Error')) {
        console.log(`[Network error]: ${message}`)
        response.errors.hposConnection = false
        return setConnection({ hposConnection: false })
      }
      console.log(`[HPOS Connection Error]: ${message}`)
      response.errors.hposConnection = false
      return setConnection({ hposConnection: false })
    })
  }
})

let links = [new SchemaLink({ schema })]
links = [errorLink].concat(links)
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
