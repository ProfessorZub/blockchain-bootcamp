import { get, reject, groupBy } from 'lodash'
import { createSelector } from 'reselect'
import moment from 'moment'
import { log } from '../helpers'
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

// All Orders
const allOrdersLoaded = state => get(state, 'exchange.allOrders.loaded', false)
//export const allOrdersLoadedSelector = createSelector(allOrdersLoaded, loaded => loaded) // Gregory did not export selector for this function

const allOrders = state => get(state, 'exchange.allOrders.data', [])      // Gregory did not export selector for this function
// export const allOrdersSelector = createSelector(allOrders, o => o)

// Cancelled Orders
const cancelledOrdersLoaded = state => get(state, 'exchange.cancelledOrders.loaded', false)
export const cancelledOrdersLoadedSelector = createSelector(cancelledOrdersLoaded, loaded => loaded)

const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
export const cancelledOrdersSelector = createSelector(cancelledOrders, o => o)

// Filled Orders
const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false)
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

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
		//console.log(`>>> filled orders:`)
		//console.log(orders)
		return orders
	}
)

// Decorate filled orders
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

// Decorate single order of any kind
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

// Decorate a single filled order
const decorateFilledOrder = (order, previousOrder) => {
	// tokenPriceClass tracks if order price was higher or lower than previous order => color format will change
	return({
		...order,
		tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder) // for css to change color
	})
}

// This class returns a string to be used as part of the className for Bootstrap element to control the color of the font
const tokenPriceClass = (tokenPrice, orderID, previousOrder) => {
	// Show green price if only one order exists
	if(previousOrder.id === orderID) {  // TODO: For the first order this will be true but is it necessary? I think the next if-statement would cover the first order because order = previousOrder
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

// The order book includes all the orders that are outstanding. They have been placed but not filled and not cancelled. 
// There are no events of type "Open" so we will need to operate on what we already have:
// open orders = all orders created - filled - cancelled

const openOrders = state => {
	const all = allOrders(state)
	const cancelled = cancelledOrders(state)
	const filled = filledOrders(state)

	// To filter out or reject the orders that are not filled or cancelled we need to compare the order ID in each order from
	// allOrders to the order ID of the filled and cancelled orders
	const openOrders = reject(all, (order) => {
		// TODO: == ok? or should I use === ?
		const orderFilled = filled.some((o) => o.id == order.id)
		const orderCancelled = cancelled.some((o) => o.id == order.id)
		return (orderFilled || orderCancelled)
	})
	//log({openOrders})
	return openOrders
}



// The order book will be loaded when all the types of orders are loaded.
// TODO: This seems a bit dangerous. The only protection against trying to show the order book before we finish building it up is the order
// in which we map the state to the props in OrderBook.js: first we call orderBookSelector and then orderBookLoadedSelector; we use the latter to 
// check if it is safe to show the order book.
const orderBookLoaded = state => cancelledOrdersLoaded(state) && filledOrdersLoaded(state) && allOrdersLoaded(state)
export const orderBookLoadedSelector = createSelector(orderBookLoaded, obl => obl)

// Create the order book
export const orderBookSelector = createSelector(
	openOrders, (orders) => {
		// Decorate orders
		orders = decorateOrderBookOrders(orders)
		//log({orders})
		// Group orders into 'buy' and 'sell' orders
		orders = groupBy(orders, 'orderType')		// This returns an object with two keys: 'buy' and 'sell'
		// Get the 'buy' orders
		const buyOrders = get(orders, 'buy', [])
		// Sort orders by token price
		orders = {
			...orders,
			buyOrders: buyOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)  	// b greater than a to give thruthy result -> ascending order
		}
		// Get the 'sell' orders
		const sellOrders = get(orders, 'sell', [])
		// Sort orders by token price
		orders = {
			...orders,
			sellOrders: sellOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)  	// b greater than a to give thruthy result -> ascending order
		}
		return orders	
	}
)

const decorateOrderBookOrders = (orders) => {
	return(
		orders.map((order) => {
			order = decorateOrder(order)
			order = decorateOrderBookOrder(order)
			return (order)
		})
	)
} 

const decorateOrderBookOrder = (order) => {
	// In this exchange there is only one token. We buy it with ETH. So, if the order had tokenGive as ETH, it means we are "buying" the token.
	// If the order has tokenGive as the token address, it means we are "selling" it for ETH.
	const orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
	return({
		...order, 
		orderType,
		orderTypeClass: orderType === 'buy' ? GREEN : RED,		// for css to change the color of the font depending on type of order
		orderFillClass: orderType === 'buy' ? 'sell' : 'buy'	// TODO: css for what??
	})
}