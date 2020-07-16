const hiddenTransactionIds = []
const setHiddenTransactionIds = jest.fn()

export default () => ({
	hiddenTransactionIds,
	setHiddenTransactionIds
})
