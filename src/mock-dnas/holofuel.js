const transactionList = [
  {
    ledger: {
      balance: 20,
      credit: 41,
      payable: 24,
      receivable: 15
    },
    next: {
      state: null, // >> NB: IF State is left blank, it returns ALL TRANSACIONS by default.
      since: '2018-04-12',
      until: '2018-07-01',
      limit: 50
    },
    over: {
      first: 1,
      count: 50,
      total: 150
    },
    transactions: [
      {
        timestamp: '2018-07-19',
        state: 'outgoing/completed',
        origin: '1GxHKZ8HCxKUBN7tQHTu75FN82g4sx2zP6',
        event: {
          Request: {
            from: 'HScQcbifkviyfvbkdf',
            to: 'HSvlniudbvskhfv',
            amount: '5',
            fee: '0.1',
            deadline: '12/09/2019',
            notes: 'Note',
            synchronous: false
          }
        },
        adjustment: {
          balance: 13,
          payable: 80,
          receivable: 93
        }
      },
      {
        timestamp: '2019-05-09',
        state: 'incoming/completed',
        origin: 'asdfas8HCijlkmxKUBN7tQHTu75FNp439joi',
        event: {
          Request: {
            from: 'HScQcbifkviyfvbkdf',
            to: 'HSvlniudbvskhfv',
            amount: '50',
            fee: '1',
            deadline: '12/09/2019',
            notes: 'Note',
            synchronous: false
          }
        },
        adjustment: {
          balance: 59,
          payable: 68,
          receivable: 4.1
        }
      },
      {
        timestamp: '2018-12-11',
        state: 'outgoing/approved',
        origin: '1DEiFZ1kThW4AVtDmL1w2oDyEKYKcqBcRB',
        event: {
          Request: {
            from: 'HScQcbifkviyfvbkdf',
            to: 'HSvlniudbvskhfv',
            amount: '25',
            fee: '0.21',
            deadline: '12/09/2019',
            notes: 'Note',
            synchronous: false
          }
        },
        adjustment: {
          balance: 84,
          payable: 8,
          receivable: 12
        }
      },
      {
        timestamp: '2018-04-27',
        state: 'incoming/approved',
        origin: '1MNMQcEsd3BkQpaFUyZrViQ26axooErWtc',
        event: {
          Request: {
            from: 'HScQcbifkviyfvbkdf',
            to: 'HSvlniudbvskhfv',
            amount: '15',
            fee: '0.11',
            deadline: '12/09/2019',
            notes: 'Note',
            synchronous: false
          }
        },
        adjustment: {
          balance: 47,
          payable: 79,
          receivable: 61
        }
      }
    ]
  }
]

const holofuel = {
  transactions: {
    list_transactions: () => transactionList,
    list_pending: () => [],
    request: ({ from, amount, deadline }) => '1MNMQcEsd3BkQpaFUyZrViQ26axooErWtc', // NOTE: import a encryption to hash these for deterministic testing
    promise: ({ to, amount, request, deadline }) => '1DEiFZ1kThW4AVtDmL1w2oDyEKYKcqBcRB',
    receive_payment: ({ origin }) => 'asdfas8HCijlkmxKUBN7tQHTu75FNp439joi'
  }
}

export default holofuel
