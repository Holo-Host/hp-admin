import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'

import apolloLogger from 'apollo-link-logger'
import { SchemaLink } from 'apollo-link-schema'
import { InMemoryCache } from 'apollo-cache-inmemory'
import schema from 'graphql-server'

let links = [new SchemaLink({ schema })]
if (process.env.NODE_ENV !== 'test' && false) {
  links = [apolloLogger].concat(links)
}

const link = ApolloLink.from(links)

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true
})

export default apolloClient
