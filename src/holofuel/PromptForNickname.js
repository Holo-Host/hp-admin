import React, { useState, useEffect, useCallback } from 'react'
import { useHistory, Link } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import useWhoamiContext from 'holofuel/contexts/useWhoamiContext'
import { PROFILE_PATH } from 'holofuel/utils/urls'
import 'holofuel/global-styles/colors.css'
import 'holofuel/global-styles/index.css'

function UserPromptMessage ({ newMessage }) {
  const resetFlashMessage = useCallback(
    () => newMessage('', 0),
    [newMessage])

  const userMessage = 'It looks like you don\'t yet have a Holofuel Account Nickname. Visit your profile page to personalize your nickname so your peers can easily recognize you.'
  const linkMessage = 'Click here to visit your profile.'
  return <>
    <div className='message'>{userMessage}</div>
    <br />
    <Link to={PROFILE_PATH} onClick={resetFlashMessage}>{linkMessage}</Link>
  </>
}

function PromptForNickname ({
  children
}) {
  const { loading, data: { holofuelUser: { id, nickname } = {} } = {} } = useQuery(HolofuelUserQuery)

  const { setWhoami, setIsLoading } = useWhoamiContext()
  const { newMessage } = useFlashMessageContext()

  const [hasReceivedNotice, setHasReceivedNotice] = useState(false)
  const history = useHistory()
  const pathname = history.location.pathname

  useEffect(() => {
    setIsLoading(loading)

    if (!isEmpty(id)) {
      setWhoami({ id, nickname })
    }
  }, [id, nickname, setWhoami, loading, setIsLoading])

  useEffect(() => {
    if (pathname === `/holofuel/${PROFILE_PATH}`) {
      newMessage('', 0)
    }

    // eslint-disable-next-line no-useless-return
    if (hasReceivedNotice) return
    else if (!isEmpty(id) && isEmpty(nickname)) {
      newMessage(<UserPromptMessage newMessage={newMessage} />, 0)
      setHasReceivedNotice(true)
    }
  }, [id, nickname, hasReceivedNotice, newMessage, pathname])

  return <>{children}</>
}

export default PromptForNickname
