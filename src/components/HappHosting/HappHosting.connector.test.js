import React from 'react'
import { render } from '@testing-library/react'
import { MockedProvider } from 'react-apollo/test-utils'
import wait from 'waait'
import AllHappsQuery from 'graphql/AllHappsQuery.gql'
import connector from './HappHosting.connector'

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
            hash: 'hash1'
          },
          {
            id: 2,
            title: 'Holo Community',
            thumbnailUrl: 'thumb.png',
            homepageUrl: 'home.com',
            hash: 'hash2'
          }
        ]
      }
    }
  }
]

describe('connector', () => {
  it('runs the AllHapsQuery', async () => {
    let allHapps

    const MockComponent = props => {
      allHapps = props.allHapps
      return null
    }

    const ConnectedMockComponent = connector(MockComponent)

    render(<MockedProvider mocks={mocks} addTypename={false}>
      <ConnectedMockComponent />
    </MockedProvider>)
    await wait(1)
    expect(allHapps).toHaveLength(2)
    expect(allHapps[0].title).toEqual('Holofuel')
    expect(allHapps[1].title).toEqual('Holo Community')
    expect(allHapps[0].hash).toEqual('hash1')
  })
})
