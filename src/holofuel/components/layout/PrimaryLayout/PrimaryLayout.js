import React, { useContext, useState, useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import { object } from 'prop-types'
import cx from 'classnames'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import ScreenWidthContext from 'holofuel/contexts/screenWidth'
import useCounterpartyListContext from 'contexts/useCounterpartyListContext'
import SideMenu from 'holofuel/components/SideMenu'
import Header from 'holofuel/components/Header'
import FlashMessage from 'holofuel/components/FlashMessage'
import AlphaFlag from 'holofuel/components/AlphaFlag'
import { STATUS } from 'models/Transaction'
import { getTxCounterparties, findNewCounterpartyTransactions } from 'data-interfaces/HoloFuelDnaInterface'
import styles from './PrimaryLayout.module.css' // eslint-disable-line no-unused-vars
import 'holofuel/global-styles/colors.css'
import 'holofuel/global-styles/index.css'

function PrimaryLayout ({
  children,
  headerProps = {},
  showAlphaFlag = true
}) {
  const { data: { holofuelActionableTransactions: actionableTransactions = [] } = {} } = useQuery(HolofuelActionableTransactionsQuery, { fetchPolicy: 'cache-and-network', pollInterval: 20000 })
  const { loading: holofuelUserLoading, data: { holofuelUser = {} } = {} } = useQuery(HolofuelUserQuery)
  const { loading: ledgerLoading, data: { holofuelLedger: { balance: holofuelBalance } = {} } = {} } = useQuery(HolofuelLedgerQuery, { fetchPolicy: 'cache-and-network' })

  const inboxCount = actionableTransactions.filter(actionableTx => actionableTx.status !== STATUS.canceled && (actionableTx.status !== STATUS.declined)).length

  const isWide = useContext(ScreenWidthContext)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const hamburgerClick = () => setMenuOpen(!isMenuOpen)
  const handleMenuClose = () => setMenuOpen(false)

  const { counterpartyList, setCounterpartyList } = useCounterpartyListContext()

  useEffect(() => {
    if (!isEmpty(actionableTransactions)) {
      const newCounterpartyTransactions = findNewCounterpartyTransactions(actionableTransactions)
      console.log('newCounterpartyTransactions : ', newCounterpartyTransactions)

      if (!isEmpty(newCounterpartyTransactions)) {
        const newCounterpartyDetials = getTxCounterparties(newCounterpartyTransactions)
        setCounterpartyList(...counterpartyList, newCounterpartyDetials)
      }
    }
  }, [counterpartyList, setCounterpartyList, actionableTransactions, getTxCounterparties, findNewCounterpartyTransactions])

  return <div styleName={cx('styles.primary-layout', { 'styles.wide': isWide }, { 'styles.narrow': !isWide })}>
    <Header {...headerProps} agent={holofuelUser} agentLoading={holofuelUserLoading} hamburgerClick={hamburgerClick} inboxCount={inboxCount} />
    <SideMenu
      isOpen={isMenuOpen}
      handleClose={handleMenuClose}
      agent={holofuelUser}
      agentLoading={holofuelUserLoading}
      inboxCount={inboxCount}
      holofuelBalance={holofuelBalance}
      ledgerLoading={ledgerLoading}
      isWide={isWide}
    />
    {showAlphaFlag && <AlphaFlag styleName='styles.alpha-flag' />}
    <div styleName='styles.content'>
      <FlashMessage />
      {children}
    </div>
  </div>
}

PrimaryLayout.propTypes = {
  headerProps: object
}

export default PrimaryLayout
