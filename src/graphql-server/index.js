// import express from 'express'
// import bodyParser from 'body-parser'
// import { graphiqlExpress, graphqlExpress } from 'apollo-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import typeDefs from './schema.graphql'
import resolvers from './resolvers'

console.log('2 - If we remove this, your app might break!!', typeDefs)

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

// // Initialize the app
// const app = express()
//
// // The GraphQL endpoint
// app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }))
//
// // GraphiQL, a visual editor for queries
// app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))
//
// // Start the server
// app.listen(3000, () => {
//   console.log('Go to http://localhost:3000/graphiql to run queries!')
// });

export default schema
