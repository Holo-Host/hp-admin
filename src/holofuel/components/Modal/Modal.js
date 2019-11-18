import React from 'react'
import ReactModal from 'react-modal'
import './Modal.module.css'

const customOverlayStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(44, 64, 90, 0.3)'
  }
}

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
      appElement={document.getElementById('root')}
      style={customOverlayStyles}
    >
      {children}
      <button styleName='close-btn' onClick={handleClose}>Close Modal</button>
    </ReactModal>
  )
}

export default Modal
