import React from 'react'
import { render } from '@testing-library/react'
import HappHosting from './HappHosting'

describe('HappHosting', () => {
  const allHapps = [
    {
      id: 1,
      title: 'Holofuel',
      thumbnailUrl: 'thumb.png',
      homepageUrl: 'home.com',
      hash: 'fklmdf'
    },
    {
      id: 2,
      title: 'Holo Community',
      thumbnailUrl: 'thumb.png',
      homepageUrl: 'home.com',
      hash: 'fklmdf'
    }
  ]

  it('renders', async () => {
    const { getByText, getAllByText } = render(<HappHosting allHapps={allHapps} />)
    expect(getByText('Holofuel')).toBeTruthy()
    expect(getByText('Holo Community')).toBeTruthy()
    expect(getAllByText('Home Page')).toHaveLength(2)
  })
})
