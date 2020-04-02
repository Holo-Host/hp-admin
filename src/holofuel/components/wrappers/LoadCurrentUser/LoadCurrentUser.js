import React, { useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import useCurrentUserContext from 'holofuel/contexts/useCurrentUserContext'
import { useLoadingFirstTime } from 'utils'

function LoadCurrentUser ({
  children
}) {
  const { loading, data: { holofuelUser = {} } = {} } = useQuery(HolofuelUserQuery, { fetchPolicy: 'cache-and-network' })

  const loadingFirstTime = useLoadingFirstTime(loading)
  const { setCurrentUser, setCurrentUserLoading, currentUserLoading } = useCurrentUserContext()

  useEffect(() => {
    if (!isEmpty(holofuelUser)) {
      setCurrentUser(holofuelUser)
    }
  }, [holofuelUser, setCurrentUser])

  useEffect(() => {
    if (loadingFirstTime !== currentUserLoading) {
      setCurrentUserLoading(loadingFirstTime)
    }
  }, [loadingFirstTime, currentUserLoading, setCurrentUserLoading])

  return <>{children}</>
}

export default LoadCurrentUser
