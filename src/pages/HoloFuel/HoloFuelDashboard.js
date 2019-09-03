import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import './HoloFuelDashboard.module.css'
import HolofuelLedgerState from 'graphql/HolofuelLedgerStateQuery.gql'

export default function HoloFuelDashboard ({ history: { push } }) {
  const { data: { holofuelLedgerState = [] } } = useQuery(HolofuelLedgerState)

  return <div styleName='container'>
    <div styleName='header'>
      <span styleName='title'>HoloFuel Dashboard</span>
    </div>
    <main>
      <h3 styleName='holofuel-ledger'> HoloFuel Ledger</h3>
      {!isEmpty(holofuelLedgerState) && <section styleName='account-ledger-state'>
        <h4 styleName='ledger-detail'>Balance: { holofuelLedgerState.balance }</h4>
        <h4 styleName='ledger-detail'>Credit: { holofuelLedgerState.credit }</h4>
        <h4 styleName='ledger-detail'>Payable: { holofuelLedgerState.payable }</h4>
        <h4 styleName='ledger-detail'>Receivable: { holofuelLedgerState.receivable }</h4>
        <h4 styleName='ledger-detail'>Fees: { holofuelLedgerState.fees }</h4>
      </section>
      }
    </main>
  </div>
}
