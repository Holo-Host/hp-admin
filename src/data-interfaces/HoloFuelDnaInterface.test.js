import { uniq } from 'lodash/fp'
import { setMockZomeCallResults, instanceCreateZomeCall } from 'holochainClient'
import HoloFuelDnaInterface from 'data-interfaces/HoloFuelDnaInterface'

jest.mock('holochainClient')

const hasNoDuplicates = arrayOfPrimitives => uniq(arrayOfPrimitives).length === arrayOfPrimitives.length

const defaultMockZomeCallResults = {
  'profile/get_profile': {
    id: 1,
    nickname: 'the counterparty'
  }
}

const fourRequestsWithADupe = ['QmZR4u634UN9TtwaHvcS1vUkh6VdhmxUfkzTHjmKxZMryz', 'A different hash', 'QmZR4u634UN9TtwaHvcS1vUkh6VdhmxUfkzTHjmKxZMryz', 'Another different hash']
  .map(hash => ({
    event: [
      // we only change this hash because that's what we're deduping on
      hash,
      '2019-09-10T23:18:20+00:00',
      {
        Request: {
          from: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
          to: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
          amount: '124500.00',
          fee: '2',
          deadline: '2020-12-02T00:00:00+00:00',
          notes: 'I want my $2!',
          synchronous: null
        }
      }
    ],
    provenance: [
      'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
      'JSnAoopQg0fVHsA3dQIvJ3tRl5CRdtBbCAjzUZLMaWsD51G8nieRhoKK8JIKqkjscsprJe+j+ceun9oPpoc3AA=='
    ]
  }))

const fourDeclinedRequestsWithADupe = fourRequestsWithADupe.map(({ event }) => event)

describe('allActionable', () => {
  it('dedupes transactions', async () => {
    const listPendingResult = {
      requests: fourRequestsWithADupe,
      promises: [],
      declined: [],
      canceled: []
    }
    setMockZomeCallResults({
      ...defaultMockZomeCallResults,
      'transactions/list_pending': listPendingResult
    })

    const dedupedTransactions = await HoloFuelDnaInterface.transactions.allActionable()
    expect(dedupedTransactions).toHaveLength(3)
    expect(hasNoDuplicates(dedupedTransactions)).toBe(true)
  })
})

describe('allDeclinedTransactions', () => {
  it('dedupes transactions', async () => {
    setMockZomeCallResults({
      ...defaultMockZomeCallResults,
      'transactions/list_pending_declined': fourDeclinedRequestsWithADupe
    })

    const dedupedTransactions = await HoloFuelDnaInterface.transactions.allDeclinedTransactions()
    expect(dedupedTransactions).toHaveLength(3)
    expect(hasNoDuplicates(dedupedTransactions)).toBe(true)
  })
})
