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
        balance: {
          Ok: '0'
        },
        payable: {
          Ok: '40.01'
        },
        receivable: {
          Ok: '0'
        },
        fees: {
          Ok: '0'
        },
        resulting_balance: {
          // 'This endpoint is a WIP'
          Ok: '0'
        }
      }
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
        event: '2019-08-30T11:19:33+00:00'
      },
      adjustment: {
        balance: {
          Ok: '10.01'
        },
        payable: {
          Ok: '0'
        },
        receivable: {
          Ok: '0'
        },
        fees: {
          Ok: '0'
        },
        resulting_balance: {
          // 'This endpoint is a WIP'
          Ok: '0'
        }
      }
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
        }
      },
      timestamp: {
        origin: '2019-08-30T11:17:16+00:00',
        event: '2019-08-30T11:19:32+00:00'
      },
      adjustment: {
        balance: {
          Ok: '-10.01'
        },
        payable: {
          Ok: '0'
        },
        receivable: {
          Ok: '0'
        },
        fees: {
          Ok: '0'
        },
        resulting_balance: {
          // 'This endpoint is a WIP'
          Ok: '0'
        }
      }
    },
    {
      index: 1,
      state: 'outgoing/approved',
      origin: 'QmVGe2MVJeVLpXZfWMXPLZuH6fPBQbtcbPuh9fzBFEDQxj',
      event: {
        Promise: {
          tx: {
            from: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
            to: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
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
        balance: {
          Ok: '0'
        },
        payable: {
          Ok: '202.0101'
        },
        receivable: {
          Ok: '0'
        },
        fees: {
          Ok: '0'
        },
        resulting_balance: {
          // 'This endpoint is a WIP'
          Ok: '0'
        }
      }
    },
    {
      index: 0,
      state: 'incoming/requested',
      origin: 'QmZR4u634UN9TtwaHvcS1vUkh6VdhmxUfkzTHjmKxZMryz',
      event: {
        Request: {
          from: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
          to: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
          amount: '200.01',
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
        balance: {
          Ok: '0'
        },
        payable: {
          Ok: '0'
        },
        receivable: {
          Ok: '0'
        },
        fees: {
          Ok: '0'
        },
        resulting_balance: {
          // 'This endpoint is a WIP'
          Ok: '0'
        }
      }
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
    {
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
    }
  ]
}

const agents = [
  {
    nick: 'Perry',
    pub_sign_key: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r'
  },
  {
    nick: 'Sam',
    pub_sign_key: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi'
  }
]

const whoamiObj = (agentId) => agents.find(agent => agent.pub_sign_key === agentId) || { error: 'No agent was found by this id.' }

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

const NUM_SALT_ROUNDS = 10
const holofuel = {
  transactions: {
    whoami: ({ agentId }) => agentId ? whoamiObj(agentId) : agents[0],
    ledger_state: () => transactionList.ledger,
    list_transactions: () => transactionList,
    list_pending: listPending,
    request: ({ from, amount, deadline }) => bcrypt.hashSync((from + amount + deadline), NUM_SALT_ROUNDS),
    promise: ({ to, amount, request, deadline }) => bcrypt.hashSync((to + amount + request + deadline), NUM_SALT_ROUNDS),
    receive_payment: ({ promise, promise_sig: sig, promise_commit: commit }) => bcrypt.hashSync((promise + sig + commit + 'accepted'), NUM_SALT_ROUNDS),
    receive_payments_pending: ({ promises }) => bcrypt.hashSync((promises + 'accepted'), NUM_SALT_ROUNDS),
    decline: ({ origin }) => bcrypt.hashSync((origin + 'declined'), NUM_SALT_ROUNDS),
    cancel: ({ origin }) => bcrypt.hashSync((origin + 'cancelled'), NUM_SALT_ROUNDS)
  }
}

export default holofuel
