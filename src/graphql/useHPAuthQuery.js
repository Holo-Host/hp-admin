import { useQuery, useMutation } from '@apollo/react-hooks'
import useAuthTokenContext from 'contexts/useAuthTokenContext'

// this makes a graphql query but adds the authToken parameter to the variables

export default function useHPAuthQuery (query, options = {}) {
  const { authToken } = useAuthTokenContext()
  const { variables = {} } = options
  console.log('useHPAuthQuery authToken', authToken)
  return useQuery(query, { ...options, variables: { ...variables, authToken } })
}

export function useHPAuthMutation (query, options = {}) {
  const { authToken } = useAuthTokenContext()
  const { variables = {} } = options
  console.log('useHPAuthMutation authToken', authToken)
  return useMutation(query, { ...options, variables: { ...variables, authToken } })
}
