import React from 'react'
import { func, string } from 'prop-types'

export const altText = 'Menu Icon'
const imageData = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMjQgNmgtMjR2LTRoMjR2NHptMCA0aC0yNHY0aDI0di00em0wIDhoLTI0djRoMjR2LTR6Ii8+PC9zdmc+'

export default function MenuIcon ({
  onClick,
  className
}) {
  return <img
    onClick={onClick}
    className={className}
    src={imageData}
    alt={altText} />
}

MenuIcon.propTypes = {
  onClick: func,
  className: string
}
