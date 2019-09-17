import React from 'react'
import { Route } from 'react-router-dom'

import Dashboard from 'pages/holofuel/Dashboard'
import TransactionHistory from 'pages/holofuel/TransactionHistory'
import Inbox from 'pages/holofuel/Inbox'
import CreateOffer from 'pages/holofuel/CreateOffer'
import CreateRequest from 'pages/holofuel/CreateRequest'

export default function HPAdminRouter () {
  return <>
    <Route path='/(|dashboard)' exact component={Dashboard} />
    <Route path='/inbox' exact component={Inbox} />
    <Route path='/offer' exact component={CreateOffer} />
    <Route path='/request' exact component={CreateRequest} />
    <Route path='/history' component={TransactionHistory} />
  </>
}
