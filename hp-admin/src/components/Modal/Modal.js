import React from 'react'
import ReactModal from 'react-modal'
import './Modal.module.css'

const Modal = ({
  isOpen = false,
  contentLabel,
  handleClose = () => null,
  className,
  children
}) => {
  return (
    <ReactModal
      isOpen={isOpen}
      contentLabel={contentLabel}
      onRequestClose={handleClose}
      styleName='container'
      className={className}
    >
      {children}
      <button styleName='close-btn' onClick={handleClose}>Close Modal</button>
    </ReactModal>
  )
}

export default Modal
