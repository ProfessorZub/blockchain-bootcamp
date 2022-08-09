import { get } from 'lodash'
import { createSelector } from 'reselect'

const account = state => get(state,'web3.account')  // fetch account from store
export const accountSelector = createSelector(account, a => a) // simple selector that does not operate on the item fetched. It just returns it



