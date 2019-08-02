import express from 'express';
import { graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools'
import typeDefs from './schema.graphql'
import resolvers from './resolvers'

console.log("If we remove this, your app might break!!", typeDefs)

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

// Initialize the app
const app = express();

app.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql',
  }),
);

// Start the server
app.listen(3000, () => {
  console.log('Go to http://localhost:3000/graphiql to run queries!');
});

export default schema
