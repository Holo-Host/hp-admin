import React from 'react'
import TosModal from 'components/TosModal'

export default function Tos ({
  history: { push }
}) {
  const returnToSettings = () => push('/settings')

  return <TosModal handleClose={returnToSettings} isOpen />
}
