import React from 'react'
import { Route, Redirect } from 'react-router-dom'

import Home from 'holofuel/pages/Home'
import Inbox from 'holofuel/pages/Inbox'
import TransactionHistory from 'holofuel/pages/TransactionHistory'
import CreateOfferRequest from 'holofuel/pages/CreateOfferRequest'

export default function HFRouter () {
  return <>
    <Route path='/holofuel' exact component={() => <Redirect to='/holofuel/' />} />
    <Route path='(/|/holofuel/)(|home)' exact component={Home} />
    <Route path='(/|/holofuel/)inbox' exact component={Inbox} />
    <Route path='(/|/holofuel/)history' component={TransactionHistory} />
    <Route path='(/|/holofuel/)offer-request' component={CreateOfferRequest} />
  </>
}
