import React from 'react'
import AuthRoute from 'components/AuthRoute'
import { Route, Switch, Redirect } from 'react-router-dom'
import Inbox from 'holofuel/pages/Inbox'
import TransactionHistory from 'holofuel/pages/TransactionHistory'
import CreateOfferRequest from 'holofuel/pages/CreateOfferRequest'
import Profile from 'holofuel/pages/Profile'
import FourOhFour from 'holofuel/pages/FourOhFour'

function HFRoute (props) {
  if (process.env.REACT_APP_HOLOFUEL_APP === 'true') {
    console.log('good')
    return <Route {...props} />
  } else {
    console.log('bad')
    return <AuthRoute {...props} />
  }
}

// export const root = process.env.REACT_APP_HOLOFUEL_AT_ROOT === 'true'
//   ? '/'
//   : '/holofuel'

export const root = '/holofuel'

console.log('root', root)

export default function HFRouter () {
  return <Switch>
    <HFRoute path={`${root}/(|inbox)`} exact component={Inbox} />
    <HFRoute path={`${root}/history`} exact component={TransactionHistory} />
    <HFRoute path={`${root}/offer-request`} exact component={CreateOfferRequest} />
    <HFRoute path={`${root}/profile`} exact component={Profile} />
    <HFRoute path={`${root}`} exact component={() => <Redirect to={`${root}/`} />} />
    <HFRoute path='/' exact component={() => <Redirect to={`${root}/inbox`} />} />
    <HFRoute component={FourOhFour} />
  </Switch>
}

