import { graphql, compose } from 'react-apollo'
import AllAvailableHappsQuery from 'graphql/AllAvailableHappsQuery.gql'
import AllHostedHappsQuery from 'graphql/AllHostedHappsQuery.gql'

const allAvailableHapps = graphql(AllAvailableHappsQuery, {
  props: ({ data: { allAvailableHapps } }) => ({ allAvailableHapps })
})

const allHostedHapps = graphql(AllHostedHappsQuery, {
  props: ({ data: { allHostedHapps } }) => ({ allHostedHapps })
})

export default compose(
  // the order of these first two is important. We use allHostedHapps to update the cache, but don't actually use it in the component.
  allHostedHapps,
  allAvailableHapps
)
