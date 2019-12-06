import React from 'react'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import TosModal from 'holofuel/components/TosModal'

export default function Tos ({
  history: { push }
}) {
  const returnToSettings = () => push('/settings')

  return <PrimaryLayout>
    <TosModal handleClose={returnToSettings} isOpen />
  </PrimaryLayout>
}
