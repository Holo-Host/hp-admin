import React from 'react'
import AuthRoute from 'components/AuthRoute'
import { Route, Switch, Redirect } from 'react-router-dom'
import Home from 'holofuel/pages/Home'
import Inbox from 'holofuel/pages/Inbox'
import TransactionHistory from 'holofuel/pages/TransactionHistory'
import CreateOfferRequest from 'holofuel/pages/CreateOfferRequest'

function HFRoute (props) {
  if (process.env.REACT_APP_HOLOCHAIN_APP === 'true') {
    return <Route {...props} />
  } else {
    return <AuthRoute {...props} />
  }
}

export default function HFRouter () {
  return <Switch>
    <HFRoute path='/holofuel/(|home)' exact component={Home} />
    <HFRoute path='/holofuel/inbox' exact component={Inbox} />
    <HFRoute path='/holofuel/history' exact component={TransactionHistory} />
    <HFRoute path='/holofuel/offer-request' exact component={CreateOfferRequest} />
    <HFRoute path='/holofuel' exact component={() => <Redirect to='/holofuel/' />} />
    <HFRoute path='/' exact component={() => <Redirect to='/holofuel/' />} />
  </Switch>
}
