import React from 'react'
import { render } from '@testing-library/react'
import { MockedProvider } from 'react-apollo/test-utils'
import wait from 'waait'
import AllHappsQuery from 'graphql/AllHappsQuery.gql'
import ConnectedHappHosting from './index'

const mocks = [
  {
    request: {
      query: AllHappsQuery
    },
    result: {
      data: {
        allHapps: [
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
      }
    }
  }
]

describe('ConnectedHappHosting', () => {
  it('renders', async () => {
    const { getByText, getAllByText } = render(<MockedProvider mocks={mocks} addTypename={false}>
      <ConnectedHappHosting />
    </MockedProvider>)
    await wait(0)
    expect(getByText('Holofuel')).toBeTruthy()
    expect(getByText('Holo Community')).toBeTruthy()
    expect(getAllByText('Home Page').length).toEqual(2)
  })
})
