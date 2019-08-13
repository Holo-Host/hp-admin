import React from 'react'
import RegisterUser from './RegisterUser'
import { render } from '@testing-library/react'

const childrenText = 'The Children'
const children = <div>{childrenText}</div>

describe('RegisterUser', () => {
  describe('with no hostingUser', () => {
    it("returns loading screen and doesn't call register", () => {
      const props = {
        hostingUser: null,
        registerHostingUser: jest.fn()
      }
      const { getByText, queryByText } = render(<RegisterUser {...props}>{children}</RegisterUser>)
      expect(getByText('Registering User')).toBeInTheDocument()
      expect(queryByText(childrenText)).not.toBeInTheDocument()
      expect(props.registerHostingUser).not.toHaveBeenCalled()
    })
  })

  describe('with an unregistered hosting user', () => {
    it('returns loading screen and calls register', () => {
      const props = {
        hostingUser: {
          id: 1,
          isRegistered: false
        },
        registerHostingUser: jest.fn()
      }
      const { getByText, queryByText } = render(<RegisterUser {...props}>{children}</RegisterUser>)
      expect(getByText('Registering User')).toBeInTheDocument()
      expect(queryByText(childrenText)).not.toBeInTheDocument()
      expect(props.registerHostingUser).toHaveBeenCalled()
    })
  })

  describe('with a registered hosting user', () => {
    it("returns children and doesn't call register", () => {
      const props = {
        hostingUser: {
          id: 1,
          isRegistered: true
        },
        registerHostingUser: jest.fn()
      }
      const { getByText, queryByText } = render(<RegisterUser {...props}>{children}</RegisterUser>)
      expect(queryByText('Registering User')).not.toBeInTheDocument()
      expect(getByText(childrenText)).toBeInTheDocument()
      expect(props.registerHostingUser).not.toHaveBeenCalled()
    })
  })
})
