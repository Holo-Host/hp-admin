import React from 'react'
import { Route, useRouteMatch, Redirect } from 'react-router-dom'

import TransactionHistory from 'holofuel/pages/TransactionHistory'
import Inbox from 'holofuel/pages/Inbox'
import CreateOffer from 'holofuel/pages/CreateOffer'
import CreateRequest from 'holofuel/pages/CreateRequest'

export default function HFRouter () {
  const match = useRouteMatch()

  const makePath = path => {
    // strip trailing slash
    return match.url.replace(/\/$/, '') + path
  }

  return <>
    <Route path={makePath('')} exact render={() => <Redirect to={makePath('/')} />} />
    <Route path={makePath('/(|inbox)')} exact component={TransactionHistory} />
    <Route path={makePath('/offer')} exact component={CreateOffer} />
    <Route path={makePath('/request')} exact component={CreateRequest} />
    <Route path={makePath('/history')} component={TransactionHistory} />
  </>
}
