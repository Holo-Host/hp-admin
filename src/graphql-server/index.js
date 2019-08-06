import { makeExecutableSchema } from 'graphql-tools'
import typeDefs from './schema.graphql'
import resolvers from './resolvers'

console.log('1 - update this text any time you have graphql compiler issues. sigh')

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

export default schema
