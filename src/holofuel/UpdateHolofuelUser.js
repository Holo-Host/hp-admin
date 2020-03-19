import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import { PROFILE_PATH } from 'holofuel/utils/urls'
import 'holofuel/global-styles/colors.css'
import 'holofuel/global-styles/index.css'

function UpdateHolofuelUser ({
  children
}) {
  const { data: { holofuelUser: { id, nickname } = {} } = {} } = useQuery(HolofuelUserQuery)
  const [hasReceivedNotice, setHasReceivedNotice] = useState(false)

  const { newMessage } = useFlashMessageContext()
  const history = useHistory()
  const pathname = history.location.pathname

  useEffect(() => {
    if (hasReceivedNotice) return
    if (pathname === `/holofuel/${PROFILE_PATH}`) {
      newMessage('', 0)
    } else if (!isEmpty(id) && isEmpty(nickname)) {
      newMessage(`It looks like you don't yet have a Holofuel Account Nickname. Visit your profile page to personalize your nickname so your peers can easily recognize you.`, 0, 'Click here to visit your profile.', PROFILE_PATH)
      setHasReceivedNotice(true)
    }
  }, [id, nickname, hasReceivedNotice, newMessage, pathname])

  return <>{children}</>
}

export default UpdateHolofuelUser
