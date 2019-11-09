import React from 'react'
import {
  Route,
  Redirect
} from 'react-router-dom'
import { omit } from 'lodash/fp'
import useAuthTokenContext from 'contexts/useAuthTokenContext'

export default function AuthRoute (props) {
  const { isAuthed } = useAuthTokenContext()

  if (isAuthed) return <Route {...props} />

  return <Route
    {...omit('component', props)}
    render={({ location }) => <Redirect
      to={{
        pathname: '/login',
        state: { from: location }
      }}
    />}
  />
}
