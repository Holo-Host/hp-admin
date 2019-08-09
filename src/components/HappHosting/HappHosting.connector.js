import { graphql, compose } from 'react-apollo'
import AllAvailableHappsQuery from 'graphql/AllAvailableHappsQuery.gql'
import AllHostedHappsQuery from 'graphql/AllHostedHappsQuery.gql'
import HostingUserQuery from 'graphql/HostingUserQuery.gql'
import RegisterHostingUserMutation from 'graphql/RegisterHostingUserMutation.gql'
import EnableHappMutation from 'graphql/EnableHappMutation.gql'
import DisableHappMutation from 'graphql/DisableHappMutation.gql'

const allAvailableHapps = graphql(AllAvailableHappsQuery, {
  props: ({ data: { allAvailableHapps } }) => ({ allAvailableHapps })
})

const allHostedHapps = graphql(AllHostedHappsQuery, {
  props: ({ data: { allHostedHapps } }) => ({ allHostedHapps })
})

const hostingUser = graphql(HostingUserQuery, {
  props: ({ data: { hostingUser } }) => ({ hostingUser })
})

const registerHostingUser = graphql(RegisterHostingUserMutation, {
  props: ({ mutate }) => {
    return {
      // NOTE: Currently hostDoc is not validated and the content is irrelevant to the dna...
      registerHostingUser: hostDoc => mutate({
        variables: {
          hostDoc
        },
        update: (cache, { data: { registerHostingUser } }) => {
          if (registerHostingUser) {
            cache.writeQuery({
              query: HostingUserQuery,
              data: {
                hostingUser: registerHostingUser
              }
            })
          }
        }
      })
    }
  }
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
  props: ({ mutate }) => {
    return {
      disableHapp: appId => mutate({
        variables: {
          appId
        }
      })
    }
  }
})

export default compose(
  // the order of these first two is important. We use allHostedHapps to update the cache, but don't actually use it in the component.
  allHostedHapps,
  allAvailableHapps,
  enableHapp,
  disableHapp,
  registerHostingUser,
  hostingUser
)
