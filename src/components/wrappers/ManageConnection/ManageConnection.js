import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import useCurrentUserContext from 'contexts/useCurrentUserContext'
import useFlashMessageContext from 'contexts/useFlashMessageContext'
import useConnectionContext from 'contexts/useConnectionContext'
import useCurrentUserContext from 'contexts/useCurrentUserContext'
import { useInterval } from 'utils'
import { wsConnection } from 'holochainClient'
import { isLoginPage, HP_ADMIN_LOGIN_PATH } from 'utils/urls'

export function useSettingsData () {
	const { setConnectionStatus, connectionStatus } = useConnectionContext()
	const { setCurrentUser } = useCurrentUserContext()
	const onError = ({ graphQLErrors: { isHposConnectionActive } }) => {
    setConnectionStatus({ ...connectionStatus, hpos: isHposConnectionActive })
  }
	const { data: { hposSettings: settings = {} } = {} } = useQuery(HposSettingsQuery, { pollInterval: 10000, onError, notifyOnNetworkStatusChange: true, ssr: false })
	const setUser = () => {
		setCurrentUser({
			hostPubKey: settings.hostPubKey,
			hostName: settings.hostName || ''
		})
	}
  return { settings, setUser }
}

export default function ManageConnection ({
  children
}) {
  const { setConnectionStatus, connectionStatus } = useConnectionContext()
  const { setCurrentUser } = useCurrentUserContext()
  const { newMessage } = useFlashMessageContext()
  const { setUser } = useSettingsData()
  const { push } = useHistory()
    
  useInterval(() => {
    if (!isLoginPage(window)) {
      setConnectionStatus({ ...connectionStatus, holochain: wsConnection })
    }
  }, 5000)

  useEffect(() => {
    if (!connectionStatus.hpos) {
      // reroute to login on network/hpos connection error
      if (!isLoginPage(window)) {
        push(HP_ADMIN_LOGIN_PATH)
      }
      newMessage('Connecting to your Holoport...', 0)
    }

    if (!isLoginPage(window)) {
      // if inside happ, check for connection to holochain
      if (connectionStatus.hpos && !connectionStatus.holochain) {
        // reroute to login on conductor connection error as it signals emerging hpos connetion failure
        if (!isLoginPage(window)) {
          push(HP_ADMIN_LOGIN_PATH)
        }
      } else {
        newMessage('', 0)
        setUser()
      }
    } else {
      // if on login page and connected to hpos, clear message and set user
      if (connectionStatus.hpos) {
        newMessage('', 0)
        setUser()
      }
    }
  }, [connectionStatus,
    newMessage,
    push,
    setCurrentUser,
    setConnectionStatus,
    setUser])

  return <>{children}</>
}

