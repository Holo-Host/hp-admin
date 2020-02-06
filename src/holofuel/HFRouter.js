import React from 'react'
import AuthRoute from 'components/AuthRoute'
import { Switch, Redirect } from 'react-router-dom'

import Home from 'holofuel/pages/Home'
import Inbox from 'holofuel/pages/Inbox'
import TransactionHistory from 'holofuel/pages/TransactionHistory'
import CreateOfferRequest from 'holofuel/pages/CreateOfferRequest'

export default function HFRouter () {
  return <Switch>
    <AuthRoute path='/holofuel/(|home)' exact component={Home} />
    <AuthRoute path='/holofuel/inbox' exact component={Inbox} />
    <AuthRoute path='/holofuel/history' exact component={TransactionHistory} />
    <AuthRoute path='/holofuel/offer-request' exact component={CreateOfferRequest} />
    <AuthRoute path='/holofuel' exact component={() => <Redirect to='/holofuel/' />} />
    <AuthRoute path='/' exact component={() => <Redirect to='/holofuel/' />} />
  </Switch>
}
