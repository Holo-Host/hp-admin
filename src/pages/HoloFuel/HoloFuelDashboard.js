import React from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import Button from 'components/Button'
import './HoloFuelDashboard.module.css'
import HolofuelLedger from 'graphql/HolofuelLedgerQuery.gql'
import HolofuelRequestMutation from 'graphql/HolofuelRequestMutation.gql'
import HolofuelOfferMutation from 'graphql/HolofuelOfferMutation.gql'

export default function HoloFuelDashboard ({ history: { push } }) {
  const { data: { holofuelLedger = [] } } = useQuery(HolofuelLedger)
  const [holofuelRequestMutation] = useMutation(HolofuelRequestMutation)
  const [holofuelOfferMutation] = useMutation(HolofuelOfferMutation)
  const holofuelRequest = (counterparty, amount) => holofuelRequestMutation({ variables: { counterparty, amount } })
  const holofuelOffer = (counterparty, amount, requestId) => holofuelOfferMutation({ variables: { counterparty, amount, requestId } })

  const goToHfTxOverview = () => push('/holofuel')

  return <div styleName='container'>
    <div styleName='header'>
      <span styleName='title'>HoloFuel Dashboard</span>
      <Button onClick={goToHfTxOverview} styleName='menu-button'>Transaction History</Button>
    </div>
    <main>
      <h3 styleName='holofuel-ledger'> HoloFuel Ledger</h3>
      {!isEmpty(holofuelLedger) && <section styleName='account-ledger-state'>
        <h4 styleName='ledger-detail'>Balance: { holofuelLedger.balance }</h4>
        <h4 styleName='ledger-detail'>Credit: { holofuelLedger.credit }</h4>
        <h4 styleName='ledger-detail'>Payable: { holofuelLedger.payable }</h4>
        <h4 styleName='ledger-detail'>Receivable: { holofuelLedger.receivable }</h4>
        <h4 styleName='ledger-detail'>Fees: { holofuelLedger.fees }</h4>
      </section>
      }

      <section className='make-holofuel-transaction'>
        <h3 styleName='holofuel-action'>Initiate HoloFuel Transaction</h3>
        {/* NOTE: The below buttons act as a form 'submit' button.  Currently, as we await design specs, the values are hard coded in lieu of a form. */}
        <Button styleName='action-btn' onClick={() => holofuelRequest('HcSCIdm3y8fjJ8g753YEMOo4qdIctqsqrxpIEnph7Fj7dm4ze776bEPDwxoog8a', 333.33)}>Request 333.33</Button>
        <Button styleName='action-btn' onClick={() => holofuelOffer('HcSCIdm3y8fjJ8g753YEMOo4qdIctqsqrxpIEnph7Fj7dm4ze776bEPDwxoog8a', 777.77)}>Offer 777.77</Button>
      </section>
    </main>
  </div>
}
