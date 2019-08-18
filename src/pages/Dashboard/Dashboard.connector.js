import { graphql } from '@apollo/react-hoc'
import { flowRight as compose } from 'lodash'
import RegisterUserMutation from 'graphql/RegisterUserMutation.gql'
import HyloMeQuery from 'graphql/HyloMeQuery.gql'
import HappStoreUserQuery from 'graphql/HappStoreUserQuery.gql'

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
              query: HyloMeQuery,
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

const me = graphql(HyloMeQuery, {
  props: ({ data: { me } }) => ({ me })
})
const happStoreUser = graphql(HappStoreUserQuery, {
  props: ({ data: { happStoreUser } }) => ({ happStoreUser })
})

export default compose(
  me,
  happStoreUser,
  registerUser
)
