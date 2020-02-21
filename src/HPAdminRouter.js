import React from 'react'
import { Route } from 'react-router-dom'
import AuthRoute from 'components/AuthRoute'
import Dashboard from 'pages/Dashboard'
import MainMenu from 'pages/MainMenu'
import Settings from 'pages/Settings'
import Tos from 'pages/Tos'
import BrowseHapps from 'pages/BrowseHapps'
import ManagePricing from 'pages/ManagePricing'
import HostingEarnings from 'pages/HostingEarnings'
import StyleDemo from 'pages/StyleDemo'
import Login from 'pages/Login'
import FactoryResetInstructions from 'pages/FactoryResetInstructions'

function HPAdminRoute (props) {
  if (process.env.REACT_APP_RAW_HOLOCHAIN === 'true') {
    // NB: This is for purely testing out HC Zome calls (ie: hha and happ-store calls) in HP Admin, as all hpos api calls will fail (due to no pub key wrapper)
    return <Route {...props} />
  } else {
    return <AuthRoute {...props} />
  }
}

export default function HPAdminRouter () {
  return <>
    <Route path='(|/|/admin/login)' component={Login} exact />
    <HPAdminRoute path='(/admin|/admin/|/admin/dashboard)' exact component={Dashboard} />
    <HPAdminRoute path='/admin/menu' component={MainMenu} />
    <HPAdminRoute path='/admin/browse-happs' exact component={BrowseHapps} />
    <HPAdminRoute path='/admin/pricing' component={ManagePricing} />
    <HPAdminRoute path='/admin/settings' exact component={Settings} />
    <HPAdminRoute path='/admin/tos' exact component={Tos} />
    <HPAdminRoute path='/admin/earnings' component={HostingEarnings} />
    <HPAdminRoute path='/admin/factory-reset' component={FactoryResetInstructions} />
    <HPAdminRoute path='/admin/style-demo' component={StyleDemo} />
  </>
}
