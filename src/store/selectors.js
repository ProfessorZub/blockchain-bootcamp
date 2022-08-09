import { get } from 'lodash'
import { createSelector } from 'reselect'

const account = state => get(state,'web3.account')  // fetch account from store
export const accountSelector = createSelector(account, a => a) // simple selector that does not operate on the item fetched. It just returns it

const tokenLoaded = state => get(state, 'token.loaded', false)
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl)

const exchangeLoaded = state => get(state, 'exchange.loaded', false)
export	const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el)

export const contractsLoadedSelector = createSelector(
	tokenLoaded,
	exchangeLoaded,
	(tl, el) => (tl && el)
)