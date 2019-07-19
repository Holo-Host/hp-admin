import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render } from '@testing-library/react'

import SpecificButton from './SpecificButton'

it('should have "specific-button" class', () => {
  const { queryByText } = render(
    <SpecificButton />
  )

  expect(queryByText('some domain specific button')).toBeInTheDocument()
})
