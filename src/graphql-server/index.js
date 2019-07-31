import { makeExecutableSchema } from 'graphql-tools'
import typeDefs from './schema.graphql'
import resolvers from './resolvers'

console.log("If we remove this, your app might break!!", typeDefs)

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

export default schema
