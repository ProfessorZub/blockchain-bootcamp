import { createSelector } from 'reselect'

const account = state => state.web3.account  // fetch account from store
export const accountSelector = createSelector(account, account => account) // simple selector that does not operate on the item fetched