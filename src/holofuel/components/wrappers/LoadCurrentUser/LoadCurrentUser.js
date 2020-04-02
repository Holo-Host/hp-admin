import React, { useEffect, useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import useCurrentUserContext from 'holofuel/contexts/useCurrentUserContext'
import { useLoadingFirstTime } from 'utils'

function LoadCurrentUser ({
  children
}) {
  // const { loading, data: { holofuelUser = {} } = {} } = useQuery(HolofuelUserQuery)
  const { loading, data: { holofuelUser = {} } = {}, refetch: refetchHolofuelUser } = useQuery(HolofuelUserQuery, { fetchPolicy: 'cache-and-network' })

  const loadingFirstTime = useLoadingFirstTime(loading)
  const { setCurrentUser, setCurrentUserLoading, currentUserLoading } = useCurrentUserContext()
  const [hasRefetched, setHasRefetched] = useState(0)

  console.log('>>>>>>>> INSIDE load current user..');


  useEffect(() => {
    console.log('INSIDE USER  USE EFFECT..');

    if (!isEmpty(holofuelUser)) {
      console.log('>>>>>>>> FOUND user..', holofuelUser);

      setCurrentUser(holofuelUser)
    } else if (isEmpty(holofuelUser) && hasRefetched <= 5) {
      console.log('>>>>>>>> refetch user..');
      
      refetchHolofuelUser()
      setHasRefetched(hasRefetched+1)
    }
  }, [holofuelUser, setCurrentUser, hasRefetched, refetchHolofuelUser])

  useEffect(() => {
    if (loadingFirstTime !== currentUserLoading) {
      setCurrentUserLoading(loadingFirstTime)
    }
  }, [loadingFirstTime, currentUserLoading, setCurrentUserLoading])

  return <>{children}</>
}

export default LoadCurrentUser
