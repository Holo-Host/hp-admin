import React, { useState, useEffect, useCallback } from 'react'
import { useHistory, Link } from 'react-router-dom'
import { isEmpty } from 'lodash/fp'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import useCurrentUserContext from 'holofuel/contexts/useCurrentUserContext'
import { PROFILE_PATH } from 'holofuel/utils/urls'
import 'holofuel/global-styles/colors.css'
import 'holofuel/global-styles/index.css'

function UserPromptMessage ({ newMessage }) {
  const resetFlashMessage = useCallback(
    () => newMessage('', 0),
    [newMessage])

  return <>
    <div className='message'>
      It looks like you don\'t yet have a Holofuel Account Nickname. Visit your profile page to personalize your nickname so your peers can easily recognize you.
    </div>
    <br />
    <Link to={PROFILE_PATH} onClick={resetFlashMessage}>
      Click here to visit your profile.
    </Link>
  </>
}

function PromptForNickname ({
  children
}) {
  const { currentUser: { id, nickname } } = useCurrentUserContext()
  const { newMessage } = useFlashMessageContext()

  const [hasReceivedNotice, setHasReceivedNotice] = useState(false)
  const history = useHistory()
  const pathname = history.location.pathname

  useEffect(() => {
    if (pathname === `/holofuel/${PROFILE_PATH}`) {
      newMessage('', 0)
    }

    if (hasReceivedNotice) return

    if (!!id && isEmpty(nickname)) {
      newMessage(<UserPromptMessage newMessage={newMessage} />, 0)
      setHasReceivedNotice(true)
    }
  }, [id, nickname, hasReceivedNotice, newMessage, pathname])

  return <>{children}</>
}

export default PromptForNickname
