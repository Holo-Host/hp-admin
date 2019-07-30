import React from 'react'
import { render } from '@testing-library/react'
import { MockedProvider } from 'react-apollo/test-utils'
import ConnectedHappHosting from './index'
import HappHosting from './HappHosting'
import wait from 'waait'
import { mount } from 'enzyme'

import AllHappsQuery from 'graphql/AllHappsQuery.gql'
import mockData from 'mock-dnas/mockData'
import TestRenderer from 'react-test-renderer'

const mocks = [
  {
    request: {
      query: AllHappsQuery
    },
    result: {
      data: {
        allHapps: mockData['happ-store'].happs.get_all_apps
      }
    }
  }
]

describe('ConnectedHappHosting', () => {
  it('renders', async () => {
    const stuffs = mount(<MockedProvider mocks={mocks} addTypename={false}>
      <ConnectedHappHosting />
    </MockedProvider>)
    // const stuffs = TestRenderer.create(<ConnectedHappHosting />)
    await wait(1000)
    console.log('debug', stuffs.debug())
  })
})
