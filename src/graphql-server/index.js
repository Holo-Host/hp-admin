import { makeExecutableSchema } from 'graphql-tools'
import typeDefs from './schema.graphql'
import resolvers from './resolvers'

console.log('6 - If we remove this, your app might break!!')

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

export default schema
