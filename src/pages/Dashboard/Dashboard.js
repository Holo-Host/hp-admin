import React from 'react'
import { isEmpty } from 'lodash/fp'
import { useQuery } from '@apollo/react-hooks'
import { Link } from 'react-router-dom'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import HashIcon from 'components/HashIcon'
import LaptopIcon from 'components/icons/LaptopIcon'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import { useHPAuthQuery } from 'graphql/hpAuthHooks'
import HappsQuery from 'graphql/HappsQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import { presentHolofuelAmount } from 'utils'
import './Dashboard.module.css'

export default function Dashboard () {
  const { data: { hposSettings: settings = [] } = {} } = useHPAuthQuery(HposSettingsQuery)

  const { data: { happs = [] } = {} } = useQuery(HappsQuery)
  const noInstalledHapps = happs.reduce((total, happ) => happ.isEnabled ? total + 1 : total, 0)

  const { data: { holofuelLedger: { balance } = { balance: 0 } } = {} } = useQuery(HolofuelLedgerQuery)

  const greeting = !isEmpty(settings.hostName) ? `Hi ${settings.hostName}!` : 'Hi!'

  return <PrimaryLayout headerProps={{ title: 'Home' }}>
    <div styleName='avatar'>
      <HashIcon seed={settings.hostPubKey} size={42} />
    </div>
    <h2 styleName='greeting'>{greeting}</h2>

    <Card title='Hosting' subtitle='Set, track, and manage your hosted applications and users.'>
      {noInstalledHapps === 0 && <div>
        + Host your first app
      </div>}
      {noInstalledHapps > 0 && <div styleName='application-count'>
        <LaptopIcon styleName='laptop-icon' color='rgba(44, 63, 89, 0.80)' /> {noInstalledHapps} hApp{noInstalledHapps > 1 && 's'}
      </div>}
    </Card>

    <Link styleName='card' to='/browse-happs'>
      <h2 styleName='card-title'>Hosting</h2>
    </Link>

    <Link styleName='card' to='/earnings'>
      <h2 styleName='card-title'>Earnings</h2>
      {balance === 0 && <div styleName='small-text'>
        You haven't earned any HoloFuel yet
      </div>}
      {balance > 0 && <div>
        Today: {presentHolofuelAmount(balance)}
      </div>}
    </Link>

    <Link styleName='card' to='/holofuel'>
      <h2 styleName='card-title'>HoloFuel</h2>
      {balance === 0 && <div styleName='small-text'>
        You have no HoloFuel
      </div>}
      {balance > 0 && <div>
        <div styleName='small-text'>HoloFuel Balance</div>
        <div styleName='balance'>{presentHolofuelAmount(balance)}</div>
      </div>}
    </Link>

  </PrimaryLayout>
}

function Card ({ title, subtitle, linkTo, children }) {
  return <Link styleName='card' to={linkTo}>
    <h1 styleName='card-title'>{title}</h1>
    <h3 styleName='card-subtitle'>{subtitle}</h3>
    {children}
  </Link>
}
