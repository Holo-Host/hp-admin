import React from 'react'
import {
  Route,
  Redirect
} from 'react-router-dom'
import { omit } from 'lodash/fp'
import useAuthContext from 'contexts/useAuthContext'

export default function AuthRoute (props) {
  const { isAuthed } = useAuthContext()

  if (isAuthed) return <Route {...props} />

  return <Route
    {...omit('component', props)}
    render={({ location }) => <Redirect
      to={{
        pathname: '/admin/login',
        state: { from: location }
      }} />}
  />
}
