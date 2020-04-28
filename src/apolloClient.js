import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import apolloLogger from 'apollo-link-logger'
import { SchemaLink } from 'apollo-link-schema'
import { onError } from 'apollo-link-error'
import { InMemoryCache } from 'apollo-cache-inmemory'
import schema from 'graphql-server'

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
      console.log(`[HPOS Connection Error]: ${message}`)
      response.errors.isHposConnectionActive = false
      return response
    })
  }
})

let links = [new SchemaLink({ schema })]
if (process.env.REACT_APP_HOLOFUEL_APP !== 'true') {
  links = [errorLink].concat(links)
}
if (process.env.NODE_ENV === 'development') {
  links = [apolloLogger].concat(links)
}

const link = ApolloLink.from(links)

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true
})

export default apolloClient
