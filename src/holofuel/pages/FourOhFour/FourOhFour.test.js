import React from 'react'
import { render } from '@testing-library/react'
import FourOhFour from './FourOhFour'

jest.mock('holofuel/components/layout/PrimaryLayout')

describe('Tos', () => {
  it('renders 404 message', () => {
    const { getByText } = render(<FourOhFour history={{}} />)
    expect(getByText('404')).toBeInTheDocument()
  })
})
