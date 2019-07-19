import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'

import apolloLogger from 'apollo-link-logger'
import { SchemaLink } from 'apollo-link-schema'
import { InMemoryCache } from 'apollo-cache-inmemory'
import schema from 'graphql-server'

const link = ApolloLink.from([
  apolloLogger,
  new SchemaLink({ schema })
])

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true
})

export default apolloClient
