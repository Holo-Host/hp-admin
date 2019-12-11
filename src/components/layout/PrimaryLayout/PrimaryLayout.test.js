import React from 'react'
import { MockedProvider } from '@apollo/react-testing'
import { renderAndWait } from 'utils/test-utils'
import PrimaryLayout from './PrimaryLayout'

jest.mock('contexts/useFlashMessageContext')
jest.mock('contexts/useAuthTokenContext')
jest.mock('components/Header')

it('should render the header and children', async () => {
  const children = <div>children</div>
  const { getByText } = await renderAndWait(<MockedProvider><PrimaryLayout>{children}</PrimaryLayout></MockedProvider>)

  expect(getByText('Header')).toBeInTheDocument()
  expect(getByText('children')).toBeInTheDocument()
})

it('should not render header when showHeader is false', async () => {
  const children = <div>children</div>
  const props = {
    showHeader: false
  }
  const { queryByText, getByText } = await renderAndWait(<MockedProvider><PrimaryLayout {...props}>{children}</PrimaryLayout></MockedProvider>)

  expect(queryByText('Header')).not.toBeInTheDocument()
  expect(getByText('children')).toBeInTheDocument()
})
