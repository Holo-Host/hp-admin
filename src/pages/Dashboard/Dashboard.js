import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { Link } from 'react-router-dom'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HappsQuery from 'graphql/HappsQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import { presentHolofuelAmount } from 'utils'
import './Dashboard.module.css'

export default function Dashboard () {
  const { data: { holofuelUser = {} } = {} } = useQuery(HolofuelUserQuery)
  const { nickname } = holofuelUser

  const { data: { happs = [] } = {} } = useQuery(HappsQuery)
  const noInstalledHapps = happs.reduce((total, happ) => happ.isEnabled ? total + 1 : total, 0)

  const { data: { holofuelLedger: { balance } = { balance: 0 } } = {} } = useQuery(HolofuelLedgerQuery)

  const greeting = nickname ? `Hi ${nickname}!` : 'Hi!'

  return <PrimaryLayout>
    <div styleName='greeting'>{greeting}</div>
    <Link styleName='card' to='/browse-happs'>
      <h2 styleName='card-title'>Hosting</h2>
      {noInstalledHapps === 0 && <div>
        + Host your first app
      </div>}
      {noInstalledHapps > 0 && <div data-testid='hosted-apps'>
        {noInstalledHapps} Application{noInstalledHapps > 1 && 's'}
      </div>}
    </Link>
    <Link styleName='card' to='/earnings'>
      <h2 styleName='card-title'>Earnings</h2>
      {balance === 0 && <div styleName='small-text' data-testid='hosted-earnings'>
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
    {/* TODO: Determine if we want a card that links to the Settings Page too... */}
    {/* <Link styleName='card' to='/settings'>
      <h2 styleName='card-title'>Settings</h2>
    </Link> */}
  </PrimaryLayout>
}
