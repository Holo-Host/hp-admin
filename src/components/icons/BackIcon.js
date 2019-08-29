import React from 'react'
import { func, string } from 'prop-types'

const imageData = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTYuNjcgMGwyLjgzIDIuODI5LTkuMzM5IDkuMTc1IDkuMzM5IDkuMTY3LTIuODMgMi44MjktMTIuMTctMTEuOTk2eiIvPjwvc3ZnPg=='

export default function MenuIcon ({
  onClick,
  className
}) {
  return <img
    onClick={onClick}
    className={className}
    src={imageData}
    alt='Menu Icon' />
}

MenuIcon.propTypes = {
  onClick: func,
  className: string
}
