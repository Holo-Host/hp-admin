import { useEffect } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import { registerHolochainSignals, registeredSignals } from 'holochainClient'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelAcceptOfferMutation from 'graphql/HolofuelAcceptOfferMutation.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'

function useAcceptOffer () {
  const [acceptOffer] = useMutation(HolofuelAcceptOfferMutation)
  return ({ transactionId }) => acceptOffer({
    variables: { transactionId },
    refetchQueries: [{
      query: HolofuelActionableTransactionsQuery
    },
    {
      query: HolofuelLedgerQuery
    }]
  })
}

export default function HolochainSignalSubscriber () {
  const acceptOffer = useAcceptOffer()

  if (!registeredSignals['request_retry_approval']) {
    console.log('>>>> !!!!!!! >>>>>>> registeredSignals : ', registeredSignals)
    
    registerHolochainSignals({
      'request_retry_approval': signal => {
        console.log('request_retry_approval signal:', signal)
  
        // Trigger a call to receive_payments_pending zome call
        // with the returned vector of transaction ids.
        const { args: transactionId } = signal
        if (!isEmpty(transactionId)) {
            acceptOffer({ transactionId: transactionId.addresses })
        }
      }
    })
  }

  return null
}
