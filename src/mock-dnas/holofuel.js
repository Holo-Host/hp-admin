import bcrypt from 'bcryptjs'
import { isString } from 'lodash/fp'

export const transactionList = {
  ledger: {
    balance: '1038900.01',
    credit: '0',
    payable: '242.0201',
    receivable: '0',
    fees: '0'
  },
  older: {
    state: null,
    since: null,
    until: '2019-08-30T00:18:00+00:00',
    limit: null
  },
  newer: {
    state: null,
    since: '2019-08-30T11:45:10+00:00',
    until: null,
    limit: null
  },
  cover: {
    first: 0,
    count: 5,
    total: 5
  },
  transactions: [
    // Agent Perry cancelled own/initiated transaction, Perry sees cancelled outgoing transaction
    {
      index: 9,
      state: 'outgoing/canceled',
      origin: 'QmRccTDUM1UcJWuxW3aMjfYkSBFmhBnGtgB7iKZAEe5bKz',
      event: {
        Cancel: {
          entry: {
            Request: {
              from: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
              to: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
              amount: '13383',
              fee: '13.383',
              deadline: '2025-01-02T03:04:05.678901234+00:00',
              notes: 'testing...',
              synchronous: null
            }
          },
          reason: 'No longer need to buy book.'
        }
      },
      timestamp: {
        origin: '2019-12-06T11:27:49+00:00',
        event: '2019-12-06T11:29:00+00:00'
      },
      adjustment: {
        Ok: {
          balance: '0',
          payable: '0',
          receivable: '0',
          fees: '0'
        }
      },
      available: '0'
    },
    // Agent Sam cancelled transaction, Perry sees cancelled incoming transaction
    {
      index: 9,
      state: 'incoming/canceled',
      origin: 'QmRccTDUM1UcJWuxW3aMjfYkSBFmhBnGtgB7iKZAEe5bKz',
      event: {
        Cancel: {
          entry: {
            Request: {
              from: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
              to: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
              amount: '234560000',
              fee: '234560.00',
              deadline: '2025-01-02T03:04:05.678901234+00:00',
              notes: 'testing...',
              synchronous: null
            }
          },
          reason: 'Sorry, concert rained out! :('
        }
      },
      timestamp: {
        origin: '2019-12-06T11:27:49+00:00',
        event: '2019-12-06T11:29:00+00:00'
      },
      adjustment: {
        Ok: {
          balance: '0',
          payable: '0',
          receivable: '0',
          fees: '0'
        }
      },
      available: '0'
    },
    {
      index: 4,
      state: 'outgoing/approved',
      origin: 'QmYNt6DYMiymJtf8oeZ4qn86yWANurFEuAzKuzMQGhsnDd',
      event: {
        Promise: {
          tx: {
            from: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
            to: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
            amount: '40.01',
            fee: '0',
            deadline: '2020-01-22T00:00:00-02:00',
            notes: 'lyft ride',
            synchronous: null
          },
          request: null
        }
      },
      timestamp: {
        origin: '2019-08-30T11:45:10+00:00',
        event: '2019-08-30T11:45:10+00:00'
      },
      adjustment: {
        Ok: {
          balance: '0',
          payable: '40.01',
          receivable: '0',
          fees: '0'
        }
      },
      available: '0'
    },
    {
      index: 2,
      state: 'incoming/completed',
      origin: 'Qmbm4B1u3rN8ua39QwDkjmxssmcKzj4nMngbqnxU7fDfQE',
      event: {
        Receipt: {
          cheque: {
            invoice: {
              promise: {
                tx: {
                  from: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
                  to: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
                  amount: '10.01',
                  fee: '0',
                  deadline: '2020-02-02T00:00:00+00:00',
                  notes: 'Taco Tuesday!',
                  synchronous: null
                },
                request: 'Qmbm4B1u3rN8ua39QwDkjmxssmcKzj4nMngbqnxU7fDfQE'
              },
              promise_sig: 'gcAT6bIvN5wd11OS3gxd1mmimtf/5c9niLhL7eWruG1Kd3kg+CfclsbI/dG69NSXBQbvhwj1u4DLhdSMHutRAQ==',
              promise_commit: 'QmXTCCEMeobd97tiMTyqZsGGVFHL6MWyStxnePSc6MCGes'
            },
            invoice_sig: 'S6PuR1MnOB9GuOniJ018oWC6DLTB0oiyu4NjR2a0CkiKtmdMIyeePIwgBbpx6uiDlN2CQTznwzdo7Ee9/yygAQ==',
            invoice_commit: 'QmRCS3aPbfJb7GTyrGFsP8JMvFmvaD43BcXGpA9mhmtpYC',
            invoice_proof: 'QmVEQhMp7w4BEzXfCnTWGfritiWAgfWamMxmLQ2n3SdACt'
          },
          cheque_sig: 'HxhqdPgh+h1XwiNxsGf336l1PpZF+dUQ+J2wNQlKADGt0yZg7yNbKU5sujRTFR3saP5eBpnAA3hjuC7HkhVaBg==',
          cheque_commit: 'QmSXG9G8hNnfZbXBUQ6cMSNn6Y33ywLG5m6czvTLNs2VQn',
          cheque_proof: 'QmVEQhMp7w4BEzXfCnTWGfritiWAgfWamMxmLQ2n3SdACt'
        }
      },
      timestamp: {
        origin: '2019-08-30T11:16:12+00:00',
        event: '2019-08-30T07:19:33+00:00'
      },
      adjustment: {
        Ok: {
          balance: '0',
          payable: '0',
          receivable: '0',
          fees: '0'
        }
      },
      available: '4010.01'
    },
    {
      index: 3,
      state: 'outgoing/completed',
      origin: 'QmXTCCEMeobd97tiMTyqZsGGVFHL6MWyStxnePSc6MCGes',
      event: {
        Cheque: {
          invoice: {
            promise: {
              tx: {
                from: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
                to: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
                amount: '207.45',
                fee: '0',
                deadline: '2020-02-02T00:00:00+00:00',
                notes: 'Sushi Sunday!',
                synchronous: null
              },
              request: 'Qmbm4B1u3rN8ua39QwDkjmxssmcKzj4nMngbqnxU7fDfQE'
            },
            promise_sig: 'gcAT6bIvN5wd11OS3gxd1mmimtf/5c9niLhL7eWruG1Kd3kg+CfclsbI/dG69NSXBQbvhwj1u4DLhdSMHutRAQ==',
            promise_commit: 'QmXTCCEMeobd97tiMTyqZsGGVFHL6MWyStxnePSc6MCGes'
          },
          invoice_sig: 'S6PuR1MnOB9GuOniJ018oWC6DLTB0oiyu4NjR2a0CkiKtmdMIyeePIwgBbpx6uiDlN2CQTznwzdo7Ee9/yygAQ==',
          invoice_commit: 'QmRCS3aPbfJb7GTyrGFsP8JMvFmvaD43BcXGpA9mhmtpYC',
          invoice_proof: 'QmVEQhMp7w4BEzXfCnTWGfritiWAgfWamMxmLQ2n3SdACt'
        }
      },
      timestamp: {
        origin: '2019-08-28T11:17:16+00:00',
        event: '2019-11-12T11:19:32+00:00'
      },
      adjustment: {
        Ok: {
          balance: '0',
          payable: '0',
          receivable: '0',
          fees: '0'
        }
      },
      available: '295.11'
    },
    {
      index: 31,
      state: 'outgoing/completed',
      origin: 'QmXTCCEMeobd97tFHL6MWiMTyqZsGGVyStxnePSc6MCGes',
      event: {
        Cheque: {
          invoice: {
            promise: {
              tx: {
                to: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
                from: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
                amount: '3507.45',
                fee: '0',
                deadline: '2020-02-02T00:00:00+00:00',
                notes: 'Sandwich Saturday!',
                synchronous: null
              },
              request: 'Qmbm4B1u3rN8ua39QwDkjmxssmcKzj4nMngbqnxU7fDfQE'
            },
            promise_sig: 'gcAT6bIvN5wd11OS3gxd1mmimtf/5c9niLhL7eWruG1Kd3kg+CfclsbI/dG69NSXBQbvhwj1u4DLhdSMHutRAQ==',
            promise_commit: 'QmXTCCEMeobd97tiMTyqZsGGVFHL6MWyStxnePSc6MCGes'
          },
          invoice_sig: 'S6PuR1MnOB9GuOniJ018oWC6DLTB0oiyu4NjR2a0CkiKtmdMIyeePIwgBbpx6uiDlN2CQTznwzdo7Ee9/yygAQ==',
          invoice_commit: 'QmRCS3aPbfJb7GTyrGFsP8JMvFmvaD43BcXGpA9mhmtpYC',
          invoice_proof: 'QmVEQhMp7w4BEzXfCnTWGfritiWAgfWamMxmLQ2n3SdACt'
        }
      },
      timestamp: {
        origin: '2019-08-28T11:17:16+00:00',
        event: '2019-11-12T11:19:32+00:00'
      },
      adjustment: {
        Ok: {
          balance: '0',
          payable: '0',
          receivable: '0',
          fees: '0'
        }
      },
      available: '502.56'
    },
    {
      index: 1,
      state: 'outgoing/approved',
      origin: 'QmVGe2MVJeVLpXZfWMXPLZuH6fPBQbtcbPuh9fzBFEDQxj',
      event: {
        Promise: {
          tx: {
            to: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
            from: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
            amount: '200.01',
            fee: '2.0001',
            deadline: '2020-12-01T00:00:00+00:00',
            notes: null,
            synchronous: null
          },
          request: null
        }
      },
      timestamp: {
        origin: '2019-08-30T10:57:29+00:00',
        event: '2019-08-30T10:57:29+00:00'
      },
      adjustment: {
        Ok: {
          balance: '0',
          payable: '0',
          receivable: '0',
          fees: '0'
        }
      },
      available: '0'
    },
    {
      index: 0,
      state: 'incoming/requested',
      origin: 'QmZR4u634UN9TtwaHvcS1vUkh6VdhmxUfkzTHjmKxZMryz',
      event: {
        Request: {
          from: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
          to: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
          amount: '1200.034',
          fee: '2',
          deadline: '2020-12-02T00:00:00+00:00',
          notes: null,
          synchronous: null
        }
      },
      timestamp: {
        origin: '2019-08-30T00:18:00+00:00',
        event: '2019-08-30T00:18:00+00:00'
      },
      adjustment: {
        Ok: {
          balance: '0',
          payable: '0',
          receivable: '0',
          fees: '0'
        }
      },
      available: '0'
    }
  ]
}

export const pendingList = {
  requests: [
    {
      event: [
        'QmZR4u634UN9TtwaHvcS1vUkh6VdhmxUfkzTHjmKxZMryz',
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
    }
  ],
  promises: [
    [{
      event: [
        'QmYNt6DYMiymJtf8oeZ4qn86yWANurFEuAzKuzMQGhsnDd',
        '2019-09-01T11:45:10+00:00',
        {
          Promise: {
            tx: {
              from: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
              to: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
              amount: '2000',
              fee: '0',
              deadline: '2020-01-22T00:00:00-02:00',
              notes: 'lyft ride',
              synchronous: null
            },
            request: null
          }
        }
      ],
      provenance: [
        'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
        '3+BrqUuu3sC4bZmub4qGvkmfeKnkJfkm5qZGOM88uompxM0/gE2KNpvTyxpGg44MCbNMB8i8vHBmhTIDMjFwAQ=='
      ]
    }, {
      Invoice: {
        promise: {
          tx: {
            to: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
            from: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
            amount: '2000',
            fee: '0',
            deadline: '2020-01-22T00:00:00-02:00',
            notes: 'lyft ride',
            synchronous: null
          },
          request: null
        },
        promise_sig: 'gcAT6bIvN5wd11OS3gxd1mmimtf/5c9niLhL7eWruG1Kd3kg+CfclsbI/dG69NSXBQbvhwj1u4DLhdSMHutRAQ==',
        promise_commit: 'QmXTCCEMeobd97tiMTyqZsGGVFHL6MWyStxnePSc6MCGes'
      }
    }],
    [{
      event: [
        'QmYNt6DYMiymJtf8oeZ4qn86yWANurFEuAzKuzMQGhsnsj',
        '2020-01-05T11:45:10+00:00',
        {
          Promise: {
            tx: {
              from: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
              to: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
              amount: '5000',
              fee: '0',
              deadline: '2020-01-22T00:00:00-02:00',
              notes: "Here's that HF you asked for",
              synchronous: null
            },
            request: 'QmYNt6DYMiymJtf8oeZ4qn86yWANurFEuAzKuzMQGhbHgN'
          }
        }
      ],
      provenance: [
        'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
        '3+BrqUuu3sC4bZmub4qGvkmfeKnkJfkm5qZGOM88uompxM0/gE2KNpvTyxpGg44MCbNMB8i8vHBmhTIDMjFwAQ=='
      ]
    }, []]
  ],
  declined: [[
    'QmcH3rDq94ENu5gkZHHMTiNG2ocF6qns3NdQBwU7ZeN3pW',
    '2020-01-10T21:40:11+00:00',
    {
      Promise: {
        tx: {
          amount: '600',
          deadline: '2019-12-31T21:39:40.697+00:00',
          fee: '6',
          from: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
          notes: 'Pre-Seed Data',
          synchronous: null,
          to: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi'
        }
      }
    }
  ]]
}

const agentArray = [{
  agent_address: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
  nickname: '', // Perry
  avatar_url: ''
  // avatar_url: 'https://cdn.pixabay.com/photo/2018/08/28/13/29/avatar-3637561_960_720.png'
}, {
  agent_address: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
  nickname: 'Sam',
  avatar_url: 'https://cdn.pixabay.com/photo/2012/04/13/13/50/man-32481_960_720.png'
}]

const getProfile = agentId => agentArray.find(agent => agent.agent_address === agentId) || { Err: `Error locating profile for ${agentId}.` }

function listPending ({ origins }) {
  if (!origins) return pendingList
  if (isString(origins)) {
    const filter = entry => entry.event[0] === origins
    return {
      requests: pendingList.requests.filter(filter),
      promises: pendingList.promises.filter(filter)
    }
  }
  throw new Error('Array value for origins param of list_pending is not supported in the mock dna')
}

function receivedPaymentsHashMap (promiseArr) {
  return promiseArr.reduce((currentHashMap, promise) => {
    return {
      ...currentHashMap,
      [promise]: {
        Ok: bcrypt.hashSync((promise + 'accepted'), NUM_SALT_ROUNDS)
      }
    }
  }, {})
}

const NUM_SALT_ROUNDS = 10
const holofuel = {
  profile: {
    // get_my_profile is only for discovering current / personal agent
    get_my_profile: () => agentArray[0],
    // get_profile is for discovering all other agents
    get_profile: ({ agent_address: agentId }) => getProfile(agentId),
    update_my_profile: ({ nickname, avatar_url: avatarUrl }) => {
      const profile = agentArray[0]
      return { ...profile, nickname, avatar_url: avatarUrl }
    }
  },
  transactions: {
    ledger_state: () => transactionList.ledger,
    list_transactions: () => transactionList,
    list_pending: listPending,
    list_pending_declined: [],
    request: ({ from, amount, deadline }) => bcrypt.hashSync((from + amount + deadline), NUM_SALT_ROUNDS),
    promise: ({ to, amount, request, deadline }) => bcrypt.hashSync((to + amount + request + deadline), NUM_SALT_ROUNDS),
    receive_payment: ({ promise, promise_sig: sig, promise_commit: commit }) => bcrypt.hashSync((promise + sig + commit + 'accepted'), NUM_SALT_ROUNDS),
    receive_payments_pending: ({ promises }) => typeof promises === 'string' ? receivedPaymentsHashMap([promises]) : receivedPaymentsHashMap(promises),
    decline_pending: ({ origin }) => bcrypt.hashSync((origin + 'declined'), NUM_SALT_ROUNDS),
    cancel_transactions: ({ origin }) => bcrypt.hashSync((origin + 'canceled'), NUM_SALT_ROUNDS)
  }
}

export default holofuel
