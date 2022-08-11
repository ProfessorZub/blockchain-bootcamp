import { get } from 'lodash'
import { createSelector } from 'reselect'
import moment from 'moment'
import { ETHER_ADDRESS, tokens, ether, RED, GREEN} from '../helpers'

//D: For using web3 in Content.js retrieving it from state. Did this because I wanted to read the current block number to limit how far I look for orders (Ganache crashing if I go to far back)
const connection = state => get(state, 'web3.connection', false)
export const connectionSelector = createSelector(connection, c => c)
//_D

const account = state => get(state,'web3.account')  // fetch account from store
export const accountSelector = createSelector(account, a => a) // simple selector that does not operate on the item fetched. It just returns it

const tokenLoaded = state => get(state, 'token.loaded', false)
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl)

const exchangeLoaded = state => get(state, 'exchange.loaded', false)
export	const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el)

const exchange = state => get(state, 'exchange.contract')
export const exchangeSelector = createSelector(exchange, e => e)

export const contractsLoadedSelector = createSelector(
	tokenLoaded,
	exchangeLoaded,
	(tl, el) => (tl && el)
)

const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false)
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, fol => fol)

const filledOrders = state => get(state, 'exchange.filledOrders.data', [])
export const filledOrdersSelector = createSelector(
	filledOrders,
	(orders) => {
		// Sort orders by date ascending before decorating orders to simplify price comparison
		orders = orders.sort((a,b) => a.timeStamp - b.timeStamp)

		// Decorate orders
		orders = decorateFilledOrders(orders)

		// Sort orders by date descending order for display in table
		orders = orders.sort((a,b) => b.timeStamp - a.timeStamp)
		console.log(`>>> filled orders:`)
		console.log(orders)
	}
)

const decorateFilledOrders = (orders) => {
	// Track previous order to compare history
	let previousOrder = orders[0]
	return(
		orders.map(
			(order) => {
				order = decorateOrder(order)
				order = decorateFilledOrder(order, previousOrder)
				previousOrder = order
				return order
			}
		)
	)
}

const decorateOrder = (order) => {
	let etherAmount
	let tokenAmount

	// Discern betwen amounts of ether and amounts of ERC20 token. amountGive corrsponds to tokenGive and amountGet to tokenGet
	if (order.tokenGive == ETHER_ADDRESS) {
		etherAmount = order.amountGive
		tokenAmount = order.amountGet 
	} else {
		etherAmount = order.amountGet
		tokenAmount = order.amountGive 
	}

	// Calculate token price to 5 decimal places
	const precision = 100000
	let tokenPrice = (etherAmount / tokenAmount)
	tokenPrice = Math.round(tokenPrice * precision) / precision

	// Format timeStamp for human reading
	const formattedTimeStamp = moment.unix(order.timeStamp).format('h:mm:ss a M/D')

	return ({
		...order,
		etherAmount: ether(etherAmount),
		tokenAmount: tokens(tokenAmount),
		tokenPrice,
		formattedTimeStamp
	})
}

const decorateFilledOrder = (order, previousOrder) => {
	// tokenPriceClass tracks id order price was higher or lower than previous order => color format will change
	return({
		...order,
		tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
	})
}

const tokenPriceClass = (tokenPrice, orderID, previousOrder) => {
	// Show green price if only one order exists
	if(previousOrder.id === orderID) {  // TODO: For the first order this will be true but is it necessary? I think the next if would cover the first order because order = previousOrder
		return GREEN
	}

	// Show green price if order price higher than previous order
	// Show red price if order price lower than previous order
	if(previousOrder.tokenPrice <= tokenPrice) {
		return GREEN	// GREEN class is used in Bootstrap for 'success'
	} else {
		return RED 		// RED class is used in Bootstrap for 'danger'
	}
}