import React, { useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import useCurrentUserContext from 'holofuel/contexts/useCurrentUserContext'
import { useLoadingFirstTime } from 'utils'

function LoadCurrentUser ({
  children
}) {
  const { loading, data: { holofuelUser = {} } = {} } = useQuery(HolofuelUserQuery)
  const loadingFirstTime = useLoadingFirstTime(loading)

  const { setCurrentUser, setCurrentUserLoading, currentUserLoading } = useCurrentUserContext()

  useEffect(() => {
    console.log('running currentUser effect')
    if (!isEmpty(holofuelUser)) {
      console.log('updating currentUser', holofuelUser)
      setCurrentUser(holofuelUser)
    }
  }, [holofuelUser, setCurrentUser])

  useEffect(() => {
    console.log('running LOADING effect')
    if (loadingFirstTime !== currentUserLoading) {
      console.log('updating LOADING', loadingFirstTime)
      setCurrentUserLoading(loadingFirstTime)
    }
  }, [loadingFirstTime, currentUserLoading, setCurrentUserLoading])

  return <>{children}</>
}

export default LoadCurrentUser
