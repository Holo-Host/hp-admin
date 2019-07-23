import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'

const RegisterUserMutation = gql`
  mutation RegisterUser ($name: String, $avatarUrl: String) {
    registerUser(name: $name, avatarUrl: $avatarUrl) {
      id
      name
      avatarUrl
    }
  }
`

const MeQuery = gql`
  query Me {
    me {
      id
      name
      avatarUrl
      isRegistered
    }
  }
`

const registerUser = graphql(RegisterUserMutation, {
  props: ({ mutate }) => {
    return {
      registerUser: (name, avatarUrl) => mutate({
        variables: {
          name,
          avatarUrl
        },
        update: (cache, { data: { registerUser } }) => {
          if (registerUser) {
            cache.writeQuery({
              query: MeQuery,
              data: {
                me: { ...registerUser, isRegistered: true }
              }
            })
          }
        }
      })
    }
  }
})

const me = graphql(MeQuery)

export default compose(
  me,
  registerUser
)
