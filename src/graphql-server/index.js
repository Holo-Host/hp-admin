import { makeExecutableSchema } from 'graphql-tools'
import typeDefs from './schema.graphql'
import resolvers from './resolvers'

<<<<<<< HEAD
=======
console.log('6 - If we remove this, your app might break!!', typeDefs)

>>>>>>> 89f33349ab424961da7a74994044e69c7f1c6f8a
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

export default schema
