import { makeExecutableSchema } from 'graphql-tools'
import typeDefs from './schema.graphql'
import resolvers from './resolvers'

console.log('1 - Removing this log statement breaks the app. Investigate why...')

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

export default schema
