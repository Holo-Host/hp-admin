import { graphql, compose } from 'react-apollo'
import HostingUserQuery from 'graphql/HostingUserQuery.gql'
import RegisterHostingUserMutation from 'graphql/RegisterHostingUserMutation.gql'

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
  registerHostingUser
)
