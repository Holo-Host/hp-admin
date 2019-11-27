import React from 'react'
import { render } from '@testing-library/react'

import ToggleButton from './ToggleButton'

it('should render child text', () => {
  const childText = 'Child Text'
  const { getByText } = render(
    <ToggleButton>{childText}</ToggleButton>
  )

  expect(getByText(childText)).toBeInTheDocument()
})

it('should pass disabled attribute to underlying UIButton element', () => {
  const childText = 'Child Text'
  const { getByText } = render(
    <ToggleButton disabled>{childText}</ToggleButton>
  )

  expect(getByText(childText)).toHaveAttribute('disabled')
})
