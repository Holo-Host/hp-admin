import { makeExecutableSchema } from 'graphql-tools'
import typeDefs from './schema.graphql'
import resolvers from './resolvers'

// console.log('resolvers', resolvers)

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

export default schema
