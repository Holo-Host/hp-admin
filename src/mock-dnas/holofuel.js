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
        event: 'request',
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
        event: 'request',
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
        event: 'request',
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
        event: 'request',
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
    list_transactions: () => transactionList
  }
}

export default holofuel
