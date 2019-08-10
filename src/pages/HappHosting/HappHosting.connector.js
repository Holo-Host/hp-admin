import { graphql, compose } from 'react-apollo'
import AllAvailableHappsQuery from 'graphql/AllAvailableHappsQuery.gql'
import AllHostedHappsQuery from 'graphql/AllHostedHappsQuery.gql'
import EnableHappMutation from 'graphql/EnableHappMutation.gql'
import DisableHappMutation from 'graphql/DisableHappMutation.gql'

const allAvailableHapps = graphql(AllAvailableHappsQuery, {
  props: ({ data: { allAvailableHapps } }) => ({ allAvailableHapps })
})

const allHostedHapps = graphql(AllHostedHappsQuery, {
  props: ({ data: { allHostedHapps } }) => ({ allHostedHapps })
})

const enableHapp = graphql(EnableHappMutation, {
  props: ({ mutate }) => ({
    enableHapp: appId => mutate({
      variables: {
        appId
      }
    })
  })
})

const disableHapp = graphql(DisableHappMutation, {
  props: ({ mutate }) => ({
    disableHapp: appId => mutate({
      variables: {
        appId
      }
    })
  })
})

export default compose(
  // the order of these first two is important. We use allHostedHapps to update the cache, but don't actually use it in the component.
  allHostedHapps,
  allAvailableHapps,
  enableHapp,
  disableHapp
)
