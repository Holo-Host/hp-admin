import React from 'react'
import { Route, useRouteMatch } from 'react-router-dom'

import Home from 'holofuel/pages/Home'
import Inbox from 'holofuel/pages/Inbox'
import TransactionHistory from 'holofuel/pages/TransactionHistory'
import Tos from 'holofuel/pages/Tos'
import CreateOfferRequest from 'holofuel/pages/CreateOfferRequest'

export default function HFRouter () {
  const match = useRouteMatch()

  const makePath = path => {
    // strip trailing slash
    return match.url.replace(/\/$/, '') + path
  }

  return <>
    {/* <Route path={makePath('')} exact render={() => <Redirect to={makePath('/')} />} /> */}
    <Route path={makePath('/(|home)')} exact component={Home} />
    <Route path={makePath('/inbox')} exact component={Inbox} />
    <Route path={makePath('/history')} component={TransactionHistory} />
    <Route path={makePath('/tos')} exact component={Tos} />
    <Route path={makePath('/offer-request')} component={CreateOfferRequest} />
  </>
}
