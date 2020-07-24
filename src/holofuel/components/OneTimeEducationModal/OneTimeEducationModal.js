import React, { useState, useEffect } from 'react'
import Modal from 'holofuel/components/Modal'
import './OneTimeEducationModal.module.css'

export default function OneTimeEducationModal ({ id, message }) {
  const [isSelected, setIsSelectedRaw] = useState(false)
  const [isOpen, setIsOpen] = useState(true)

  // window.localStorage.removeItem(`OneTimeEducationModal.${id}.isOpen`)

  useEffect(() => {
    // doing this in a one time useEffect so that the modal doesn't close as soon as you click the checkbox
    setIsOpen(!window.localStorage.getItem(`OneTimeEducationModal.${id}.isOpen`))
    console.log('useEffect')
  }, [id])

  const setIsSelected = isSelected => {
    if (isSelected) {
      window.localStorage.setItem(`OneTimeEducationModal.${id}.isOpen`, true)
    }
    setIsSelectedRaw(isSelected)
  }

  const hideModal = () => setIsOpen(false)
  const onCheckBoxChange = () => setIsSelected(!isSelected)

  return <Modal
    isOpen={isOpen}
    handleClose={hideModal}>
    <div>{message}</div>
    <label>
      <input
        type='checkbox'
        checked={isSelected}
        onChange={onCheckBoxChange} />
      Don't show me this again
    </label>
  </Modal>
}
