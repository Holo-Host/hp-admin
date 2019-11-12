import React from 'react'

export const mockNavigateTo = jest.fn()

export const Link = ({ to, children }) => <div onClick={() => mockNavigateTo(to)}>{children}</div>

export const history = {
  push: jest.fn()
}

export const useHistory = () => history
