import React from 'react'
import { render } from '@testing-library/react'
import FactoryResetInstructions from './FactoryResetInstructions'

jest.mock('components/layout/PrimaryLayout')

describe('FactoryResetInstructions', () => {
  it('renders', () => {
    const { getByText } = render(<FactoryResetInstructions />)

    expect(getByText('Here are the intructions for resetting your device.')).toBeInTheDocument()
  })
})
