import { graphql, compose } from 'react-apollo'
import AllHappsQuery from 'graphql/AllHappsQuery.gql'
import AllAvailableHappsQuery from 'graphql/AllAvailableHappsQuery.gql'
import AllHostedHappsQuery from 'graphql/AllHostedHappsQuery.gql'
import HostingUserQuery from 'graphql/HostingUserQuery.gql'
import RegisterHostingUserMutation from 'graphql/RegisterHostingUserMutation.gql'
import EnableHappMutation from 'graphql/EnableHappMutation.gql'
import DisableHappMutation from 'graphql/DisableHappMutation.gql'


const allHapps = graphql(AllHappsQuery, {
  props: ({ data: { allHapps } }) => ({ allHapps })
})

const allAvailableHapps = graphql(AllAvailableHappsQuery, {
  props: ({ data: { allAvailableHapps } }) => ({ allAvailableHapps })
})

const allHostedHapps = graphql(AllHostedHappsQuery, {
  props: ({ data: { allHostedHapps } }) => ({ allHostedHapps })
})

const hostingUser = graphql(HostingUserQuery, {
  props: ({ data: { hostingUser } }) => ({ hostingUser })
})

const registerHostingUser = graphql( RegisterHostingUserMutation, {
  props: ({ mutate }) => {
    return {
      // NOTE: Currently host_doc is not validated and the content is irrelevant to the dna...
      registerHostingUser: ({host_doc}) => mutate({
        variables: {
          host_doc
        }
      })
    }
  }
})

const enableHapp = graphql( EnableHappMutation, {
  props: ({ mutate }) => {
    return {
      enableHapp: (app_hash = '') => mutate({
        variables: {
          app_hash
        }
      })
    }
  }
})

const disableHapp = graphql( DisableHappMutation, {
  props: ({ mutate }) => {
    return {
      disableHapp: ({app_hash}) => mutate({
        variables: {
          app_hash
        }
      })
    }
  }
})

export default compose(
  allHapps,
  allAvailableHapps,
  enableHapp,
  disableHapp,
  allHostedHapps,
  registerHostingUser,
  hostingUser
)
