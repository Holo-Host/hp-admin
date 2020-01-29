import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import apolloLogger from 'apollo-link-logger'
import { SchemaLink } from 'apollo-link-schema'
import { onError } from 'apollo-link-error'
import { InMemoryCache } from 'apollo-cache-inmemory'
import schema from 'graphql-server'
import { setConnection } from 'contexts/useConnectionContext'

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (networkError) {
    console.log(`[Network error]: ${networkError}`)
    return setConnection({ hposConnection: false })
  }

  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) => {
      if (message.startsWith('Authentication Error: ')) {
        setConnection({ hposConnection: true })
        console.log(
          `[GraphQL error]: >>>>> SHOULD BE AUTH ERROR :  Message : ${message}, Location: ${locations}, Path: ${path}`
        )
      }
      console.log('graphQLError Message : ', message)
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
