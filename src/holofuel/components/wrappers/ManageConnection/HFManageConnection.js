import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useUpdatedTransactionLists } from 'holofuel/components/layout/PrimaryLayout'
import useConnectionContext from 'holofuel/contexts/useConnectionContext'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import { INBOX_PATH } from 'holofuel/utils/urls'
import { HP_ADMIN_LOGIN_PATH } from 'utils/urls'
import { wsConnection } from 'holochainClient'
import { useInterval } from 'utils'

function HFManageConnection ({
  children
}) {
  const { refetch: refetchUser } = useQuery(HolofuelUserQuery, { fetchPolicy: 'cache-and-network' })
  const { stopPolling, startPolling } = useUpdatedTransactionLists()
  const { isConnected, setIsConnected } = useConnectionContext()
  const { newMessage } = useFlashMessageContext()
  const { push } = useHistory()
    
  useInterval(() => {
    setIsConnected(wsConnection)
  }, 5000)

  const [shouldRefetchUser, setShouldRefetchUser] = useState(false)
  const refetchHolofuelUser = useCallback(() => {
    setShouldRefetchUser(false)
    refetchUser()
  }, [setShouldRefetchUser, refetchUser])

  useEffect(() => {
    if (!isConnected) {
      newMessage('Connecting to your Holochain Conductor...', 0)
      stopPolling()
      setShouldRefetchUser(true)
      let defaultPath
      if (process.env.REACT_APP_HOLOFUEL_APP === 'true') {
        defaultPath = INBOX_PATH
      } else {
        defaultPath = HP_ADMIN_LOGIN_PATH
      }
      push(defaultPath)
    } else {
      newMessage('', 0)
      startPolling(30000)
      if (shouldRefetchUser) {
        refetchHolofuelUser()
      }
    }
  }, [isConnected,
    setIsConnected,
    push,
    newMessage,
    startPolling,
    stopPolling,
    shouldRefetchUser,
    refetchHolofuelUser])

  return <>{children}</>
}

export default HFManageConnection
