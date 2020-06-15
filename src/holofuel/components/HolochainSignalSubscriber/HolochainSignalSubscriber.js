import { useEffect } from 'react'
import { registerHolochainSignals } from 'graphql-server/holochainClient'

export default function HolochainSignalsSubscriber () {
  useEffect(() => {
    (async () => {
      registerHolochainSignals({
        'request_retry_approval': signal => {
          console.log('request_retry_approval signal:', signal)
          // trigger a call to receive_payments_pending zome call
          // with the returned vector of transaction ids.
        }
      })
    })()
  }, [])

  return null
}
