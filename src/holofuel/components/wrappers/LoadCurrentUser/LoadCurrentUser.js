import React, { useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import MyHolofuelUserQuery from 'graphql/MyHolofuelUserQuery.gql'
import useCurrentUserContext from 'holofuel/contexts/useCurrentUserContext'
import { useLoadingFirstTime } from 'utils'

function LoadCurrentUser ({
  children
}) {
  const { loading, data: { myHolofuelUser = {} } = {} } = useQuery(MyHolofuelUserQuery, { fetchPolicy: 'cache-and-network' })

  const loadingFirstTime = useLoadingFirstTime(loading)
  const { setCurrentUser, setCurrentUserLoading, currentUserLoading } = useCurrentUserContext()

  useEffect(() => {
    if (!isEmpty(myHolofuelUser)) {
      setCurrentUser(myHolofuelUser)
    }
  }, [myHolofuelUser, setCurrentUser])

  useEffect(() => {
    if (loadingFirstTime !== currentUserLoading) {
      setCurrentUserLoading(loadingFirstTime)
    }
  }, [loadingFirstTime, currentUserLoading, setCurrentUserLoading])

  return <>{children}</>
}

export default LoadCurrentUser
