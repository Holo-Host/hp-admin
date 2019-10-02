import React, { useContext, useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { object } from 'prop-types'
import cx from 'classnames'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import ScreenWidthContext from 'holofuel/contexts/screenWidth'
import SideMenu from 'holofuel/components/SideMenu'
import Header from 'holofuel/components/Header'
import FlashMessage from 'holofuel/components/FlashMessage'
import styles from './PrimaryLayout.module.css' // eslint-disable-line no-unused-vars
import 'holofuel/global-styles/colors.css'
import 'holofuel/global-styles/index.css'

export function PrimaryLayout ({
  children,
  headerProps = {}
}) {
  const { data: { holofuelActionableTransactions: transactions = [] } = {} } = useQuery(HolofuelActionableTransactionsQuery)
  const { loading: holofuelUserLoading, data: { holofuelUser = {} } = {} } = useQuery(HolofuelUserQuery)
  const { data: { holofuelLedger: { balance: holofuelBalance } = { balance: 0 } } = {} } = useQuery(HolofuelLedgerQuery)

  const inboxCount = transactions.length

  const isWide = useContext(ScreenWidthContext)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const hamburgerClick = () => setMenuOpen(!isMenuOpen)
  const handleMenuClose = () => setMenuOpen(false)

  return <div styleName={cx('styles.primary-layout', { 'styles.wide': isWide }, { 'styles.narrow': !isWide })}>
    <Header {...headerProps} agent={holofuelUser} agentLoading={holofuelUserLoading} hamburgerClick={hamburgerClick} />
    <SideMenu
      isOpen={isMenuOpen}
      handleClose={handleMenuClose}
      agent={holofuelUser}
      agentLoading={holofuelUserLoading}
      inboxCount={inboxCount}
      holofuelBalance={holofuelBalance}
    />
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
