import { graphql } from '@apollo/react-hoc'
import { flowRight as compose } from 'lodash'
import HostingUserQuery from 'graphql/HostingUserQuery.gql'
import RegisterHostingUserMutation from 'graphql/RegisterHostingUserMutation.gql'

const hostingUser = graphql(HostingUserQuery, {
  props: ({ data: { hostingUser } }) => ({ hostingUser })
})

const registerHostingUser = graphql(RegisterHostingUserMutation, {
  props: ({ mutate, result: { loading, called } }) => ({
    registerHostingUser: () => mutate({
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
    }),
    loading,
    called
  })
})

export default compose(
  registerHostingUser,
  hostingUser
)
