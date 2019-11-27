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
import MyProfile from 'pages/MyProfile'
import StyleDemo from 'pages/StyleDemo'
import Login from 'pages/Login'
import FactoryResetInstructions from 'pages/FactoryResetInstructions'

export default function HPAdminRouter () {
  return <>
    <Route path='/login' component={Login} />
    <AuthRoute path='/(|dashboard)' exact component={Dashboard} />
    <AuthRoute path='/menu' component={MainMenu} />
    <AuthRoute path='/browse-happs' exact component={BrowseHapps} />
    <AuthRoute path='/pricing' component={ManagePricing} />
    <AuthRoute path='/settings' exact component={Settings} />
    <AuthRoute path='/tos' exact component={Tos} />
    <AuthRoute path='/earnings' component={HostingEarnings} />
    <AuthRoute path='/my-profile' component={MyProfile} />
    <AuthRoute path='/factory-reset' component={FactoryResetInstructions} />
    <AuthRoute path='/style-demo' component={StyleDemo} />
  </>
}
