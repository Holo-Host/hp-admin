import { graphql, compose } from 'react-apollo'
import AllHoloFuelTransactionsQuery from 'graphql/AllHoloFuelTransactionsQuery.gql'
import AllHoloFuelPendingTransactionQuery from 'graphql/AllHoloFuelPendingTransactionQuery.gql'
import AllHoloFuelCompleteTransactionsQuery from 'graphql/AllHoloFuelCompleteTransactionsQuery.gql'

const allHoloFuelTransations = graphql(AllHoloFuelTransactionsQuery, {
  props: ({ data: { allHoloFuelTransactions } }) => ({ allHoloFuelTransactions })
})

const allHoloFuelPendingTransaction = graphql(AllHoloFuelPendingTransactionQuery, {
  props: ({ data: { allHoloFuelPendingTransactions } }) => ({ allHoloFuelPendingTransactions })
})

const allHoloFuelCompleteTransations = graphql(AllHoloFuelCompleteTransactionsQuery, {
  props: ({ data: { allHoloFuelCompleteTransactions } }) => ({ allHoloFuelCompleteTransactions })
})

export default compose(
  allHoloFuelTransations,
  allHoloFuelPendingTransaction,
  allHoloFuelCompleteTransations
)
