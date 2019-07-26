import { graphql, compose } from 'react-apollo'
import AllHappsQuery from 'graphql/AllHappsQuery.gql'

const allHapps = graphql(AllHappsQuery, {
  props: ({ data: { allHapps } }) => ({ allHapps })
})

export default compose(
  allHapps
)
