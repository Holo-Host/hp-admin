import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import { SchemaLink } from 'apollo-link-schema'
import schema from 'graphql-server'
import apolloLogger from 'apollo-link-logger'
import { onError } from 'apollo-link-error'
import { InMemoryCache } from 'apollo-cache-inmemory'

const errorLink = onError(({ graphQLErrors, response }) => {
  console.log('errorLink')
  if (graphQLErrors) {
    console.log('graphQLErrors')
    graphQLErrors.map(({ message }) => {
      console.log('gql error', message)
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
      return response
    })
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

const link = ApolloLink.from(links)

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true
})

export default apolloClient
