import { graphql } from '@apollo/react-hoc'
import { flow as compose } from 'lodash'
import AllHoloFuelTransactionsQuery from 'graphql/AllHoloFuelTransactionsQuery.gql'
import AllHoloFuelPendingTransactionQuery from 'graphql/AllHoloFuelPendingTransactionQuery.gql'
import AllHoloFuelCompleteTransactionsQuery from 'graphql/AllHoloFuelCompleteTransactionsQuery.gql'

const allHoloFuelTransactions = graphql(AllHoloFuelTransactionsQuery, {
  props: ({ data: { allHoloFuelTransactions } }) => ({ allHoloFuelTransactions })
})

const allHoloFuelPendingTransaction = graphql(AllHoloFuelPendingTransactionQuery, {
  props: ({ data: { allHoloFuelPendingTransactions } }) => ({ allHoloFuelPendingTransactions })
})

const allHoloFuelCompleteTransactions = graphql(AllHoloFuelCompleteTransactionsQuery, {
  props: ({ data: { allHoloFuelCompleteTransactions } }) => ({ allHoloFuelCompleteTransactions })
})

export default compose(
  allHoloFuelTransactions,
  allHoloFuelPendingTransaction,
  allHoloFuelCompleteTransactions
)
