import { graphql, compose } from 'react-apollo'
// import AllHPSettingsQuery from 'graphql/AllHPSettingsQuery.gql'
import UpdateHPSettingsMutation from 'graphql/UpdateHPSettingsMutation.gql'

// // Note: Query Example
// const allHPSettings = graphql(AllHPSettingsQuery, {
//   props: ({ data: { allHPSettings } }) => ({ allHPSettings })
// })

// // Note: Mutation Example
// const updateHPSettings = graphql(UpdateHPSettingsMutation, {
//   props: ({ mutate }) => ({
//     updateHPSettings: newHpSettings => mutate({
//       variables: {
//         newHpSettings
//       }
//     })
//   })
// })

export default compose(
  allPastTransactions,
  allPendingTransactions,
  offerHoloFuel,
  receiveHoloFuel
)
