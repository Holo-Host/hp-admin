import React from 'react'
import { Route } from 'react-router-dom'

import Home from 'holofuel/pages/Home'
import Inbox from 'holofuel/pages/Inbox'
import TransactionHistory from 'holofuel/pages/TransactionHistory'
import CreateOffer from 'holofuel/pages/CreateOffer'
import CreateRequest from 'holofuel/pages/CreateRequest'

export default function HFRouter () {
  return <>
    <Route path='/' exact component={Home} />
    <Route path='/inbox' exact component={Inbox} />
    <Route path='/offer' exact component={CreateOffer} />
    <Route path='/request' exact component={CreateRequest} />
    <Route path='/history' component={TransactionHistory} />
  </>
}
