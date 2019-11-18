import React from 'react'
import { isEmpty } from 'lodash/fp'
import { useQuery } from '@apollo/react-hooks'
import { Link } from 'react-router-dom'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import HashIcon from 'components/HashIcon'
import LaptopIcon from 'components/icons/LaptopIcon'
import PlusIcon from 'components/icons/PlusIcon'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import { useHPAuthQuery } from 'graphql/hpAuthHooks'
import HappsQuery from 'graphql/HappsQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import { presentHolofuelAmount } from 'utils'
import cx from 'classnames'
import './Dashboard.module.css'

// Mock value to be replaced by graphql query
export const mockEarnings = 8937

export default function Dashboard ({ earnings = mockEarnings }) {
  const { data: { hposSettings: settings = [] } = {} } = useHPAuthQuery(HposSettingsQuery)

  const { data: { happs = [] } = {} } = useQuery(HappsQuery)
  const noInstalledHapps = happs.reduce((total, happ) => happ.isEnabled ? total + 1 : total, 0)

  const { data: { holofuelLedger: { balance } = { balance: 0 } } = {} } = useQuery(HolofuelLedgerQuery)

  const isEarningsZero = Number(earnings) === 0
  const isBalanceZero = Number(balance) === 0

  const greeting = !isEmpty(settings.hostName) ? `Hi ${settings.hostName}!` : 'Hi!'

  return <PrimaryLayout headerProps={{ title: 'Home' }}>
    <div styleName='avatar'>
      <HashIcon hash={settings.hostPubKey} size={42} />
    </div>
    <h2 styleName='greeting'>{greeting}</h2>

    <Card title='Hosting' linkTo='/browse-happs' subtitle='Set, track, and manage your hosted applications and users.'>
      <div styleName='hosting-content'>
        {noInstalledHapps === 0 && <>
          <PlusInDiscIcon />Host your first hApp!
        </>}
        {noInstalledHapps > 0 && <>
          <LaptopIcon styleName='laptop-icon' color='rgba(44, 63, 89, 0.80)' /> {noInstalledHapps} hApp{noInstalledHapps > 1 && 's'}
        </>}
      </div>
    </Card>

    <Card title='Earnings' linkTo='/earnings' subtitle='Save, send, and receive Holofuel'>
      <div styleName={cx('balance', { 'empty-balance': isEarningsZero })}>
        <h4 styleName='balance-header'>
          {isEarningsZero ? 'Balance' : "Today's earnings"}
        </h4>
        <div styleName='balance-body'>
          {isEarningsZero ? "You haven't earned HoloFuel" : `${presentHolofuelAmount(earnings)} HF`}
        </div>
      </div>
    </Card>

    <Card title='Earnings' linkTo='/holofuel' subtitle='Save, send, and receive Holofuel'>
      <div styleName={cx('balance', { 'empty-balance': isBalanceZero })}>
        <h4 styleName='balance-header'>
          Balance
        </h4>
        <div styleName='balance-body'>
          {isBalanceZero ? 'You have no HoloFuel' : `${presentHolofuelAmount(balance)} HF`}
        </div>
      </div>
    </Card>
  </PrimaryLayout>
}

function Card ({ title, subtitle, linkTo, children }) {
  return <Link styleName='card' to={linkTo}>
    <h1 styleName='card-title'>{title}</h1>
    <h3 styleName='card-subtitle'>{subtitle}</h3>
    {children}
  </Link>
}

function PlusInDiscIcon () {
  return <div styleName='disc-icon'>
    <PlusIcon styleName='plus-icon' color='#06C470' />
  </div>
}
