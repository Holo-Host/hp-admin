import React from 'react'

export const mockNavigateTo = jest.fn()

export const Link = ({ to, children, 'data-testid': dataTestId }) => <div data-testid={dataTestId} onClick={() => mockNavigateTo(to)}>{children}</div>

export const history = {
  push: jest.fn()
}

export const useHistory = () => history
