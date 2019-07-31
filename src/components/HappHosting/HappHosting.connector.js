import { graphql, compose } from 'react-apollo'
import AllHappsQuery from 'graphql/AllHappsQuery.gql'
import RegisterHostingUserMutation from 'graphql/RegisterHostingUserMutation.gql'


const allHapps = graphql(AllHappsQuery, {
  props: ({ data: { allHapps } }) => ({ allHapps })
})

const registerHostingUser = graphql( RegisterHostingUserMutation, {
  props: ({ mutate }) => {
    return {
      registerHostingUser: () => mutate()
    }
  }
})

export default compose(
  allHapps,
  registerHostingUser
)
