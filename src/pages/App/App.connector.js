import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'

// TODO: Ref. hylo code for mutation ...
// export const myMutation = gql`
//   mutation MyMutation($my) {
//     myString
//   }
// `

const myResults = graphql(gql`
  query MyQuery {
    myQuery {
      myString
    }
  }
`)

export default compose(
  // myMutation,
  myResults
)
