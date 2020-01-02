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

export default function HPAdminRouter () {
  return <>
    <Route path='(|/|/admin/login)' component={Login} exact />
    <AuthRoute path='(/admin|/admin/|/admin/dashboard)' exact component={Dashboard} />
    <AuthRoute path='/admin/menu' component={MainMenu} />
    <AuthRoute path='/admin/browse-happs' exact component={BrowseHapps} />
    <AuthRoute path='/admin/pricing' component={ManagePricing} />
    <AuthRoute path='/admin/settings' exact component={Settings} />
    <AuthRoute path='/admin/tos' exact component={Tos} />
    <AuthRoute path='/admin/earnings' component={HostingEarnings} />
    <AuthRoute path='/admin/factory-reset' component={FactoryResetInstructions} />
    <AuthRoute path='/admin/style-demo' component={StyleDemo} />
  </>
}
