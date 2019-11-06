import React from 'react'
<<<<<<< HEAD
import { Route } from 'react-router-dom'
import AuthRoute from 'components/AuthRoute'
=======
import { Route, Link } from 'react-router-dom'
>>>>>>> develop
import Dashboard from 'pages/Dashboard'
import MainMenu from 'pages/MainMenu'
import Settings from 'pages/Settings'
import Tos from 'pages/Tos'
import BrowseHapps from 'pages/BrowseHapps'
import HappDetails from 'pages/HappDetails'
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
    <AuthRoute path='/browse-happs/:appId' component={HappDetails} />
    <AuthRoute path='/pricing' component={ManagePricing} />
    <AuthRoute path='/settings' exact component={Settings} />
    <AuthRoute path='/tos' exact component={Tos} />
    <AuthRoute path='/earnings' component={HostingEarnings} />
    <AuthRoute path='/my-profile' component={MyProfile} />
    <AuthRoute path='/factory-reset' component={FactoryResetInstructions} />
    <AuthRoute path='/style-demo' component={StyleDemo} />
  
    {/* NB: This is a placeholder for the ticket to holofuel build compatible with hp admin */}
    <Route path='/holofuel' render={() => <div style={{ marginTop: 50, textAlign: 'center' }}>
      This page will redirect to the HoloFuel app
      <br />
      <br />
      <br />
      <Link to='/dashboard'
        style={{
          marginLeft: 'auto',
          color: '#484848',
          backgroundColor: '#CDCDCD',
          fontWeight: 'bold',
          fontSize: 14,
          minWidth: 67,
          padding: 10,
          borderRadius: 5
        }}>
        Home
      </Link>
    </div>} />
  </>
}
