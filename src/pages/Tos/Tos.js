import React from 'react'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import TosModal from 'components/TosModal'

export default function Tos ({
  history: { push }
}) {
  const returnToSettings = () => push('/settings')

  return <PrimaryLayout>
    <TosModal handleClose={returnToSettings} isOpen />
  </PrimaryLayout>
}
