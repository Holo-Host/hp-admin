import React from 'react'
import { Route, useRouteMatch, Redirect } from 'react-router-dom'

import Home from 'holofuel/pages/Home'
import Inbox from 'holofuel/pages/Inbox'
import TransactionHistory from 'holofuel/pages/TransactionHistory'
import CreateOffer from 'holofuel/pages/CreateOffer'
import CreateRequest from 'holofuel/pages/CreateRequest'
import Tos from 'holofuel/pages/Tos'

export default function HFRouter () {
  const match = useRouteMatch()

  const makePath = path => {
    // strip trailing slash
    return match.url.replace(/\/$/, '') + path
  }

  return <>
    <Route path={makePath('')} exact render={() => <Redirect to={makePath('/')} />} />
    <Route path={makePath('/(|home)')} exact component={Home} />
    <Route path={makePath('/inbox')} exact component={Inbox} />
    <Route path={makePath('/offer')} exact component={CreateOffer} />
    <Route path={makePath('/request')} exact component={CreateRequest} />
    <Route path={makePath('/history')} component={TransactionHistory} />
    <Route path={makePath('/tos')} exact component={Tos} />
  </>
}
