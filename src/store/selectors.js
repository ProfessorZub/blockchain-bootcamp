import { get, reject, groupBy, maxBy, minBy } from 'lodash'
import { createSelector } from 'reselect'
import moment from 'moment'
import { log, ETHER_ADDRESS, tokens, ether, RED, GREEN} from '../helpers'

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


// Order Book
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

// My Filled Orders
export const myFilledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded ) 

export const myFilledOrdersSelector = createSelector(
	account,
	filledOrders,
	(account, orders) => {
		// Find our orders
		orders = orders.filter((o) => o.user === account || o.userFill === account ) // this includes orders created by account or filled by account
		// Sort orders by date ascending
		orders = orders.sort((a,b) => a.timeStamp - b.timeStamp)
		// Decorate orders - add display attributes
		orders = decorateMyFilledOrders(orders, account)
		return orders
	}
)

const decorateMyFilledOrders = (orders, account) => {
	return(
		orders.map((order) => {
			order = decorateOrder(order)
			order = decorateMyFilledOrder(order, account)
			return(order)
		})
	)
}

const decorateMyFilledOrder = (order, account) => {
	// The order passed to this function could be one that account created or filled. 'myOrder' will be true if 'order' was created by account.
	const myOrder = order.user === account 

	// If the order belongs to account and token given is ETH then it is "my buy order". If token given is MAGG then it is "my sell order"
	// For the rest, which would be orders that account filled, the opposite is true. Token given is ETH means it was someone else's buy order so it was my sell.
	let orderType
	if (myOrder) {
		orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'	
	} else {
		orderType = order.tokenGive === ETHER_ADDRESS ? 'sell' : 'buy'
	}

	return({
		...order,
		orderType,
		orderTypeClass: (orderType === 'buy' ? GREEN : RED),  // for UI display
		orderSign: (orderType === 'buy' ? '+' : '-')		 // for UI display
	})
}

// My Open Orders
export const myOpenOrdersLoadedSelector = createSelector(orderBookLoaded, loaded => loaded ) 

export const myOpenOrdersSelector = createSelector(
	account,
	openOrders,
	(account, orders) => {
		// Find our orders
		orders = orders.filter((o) => o.user === account)
		// Decorate orders - add display attributes
		orders = decorateMyOpenOrders(orders)
		// Sort orders by date descending
		orders = orders.sort((a,b) => b.timeStamp - a.timeStamp)
		return orders
	}
)

const decorateMyOpenOrders = (orders) => {
	return(
		orders.map((order) => {
			order = decorateOrder(order)
			order = decorateMyOpenOrder(order)
			return(order)
		})
	)
}

const decorateMyOpenOrder = (order, account) => {
	let orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'

	return({
		...order,
		orderType,
		orderTypeClass: (orderType === 'buy' ? GREEN : RED)  // for UI display
	})
}

export const priceChartLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

export const priceChartSelector = createSelector(
	filledOrders,
	(orders) => {
		// Sort orders by date ascending
		orders = orders.sort((a,b) =>  a.timeStamp - b.timeStamp)
		// Decorate orders with general decoration
		orders = orders.map((order) => decorateOrder(order))
		// Get last two orders for final price & price change
		let secondLastOrder, lastOrder
		[secondLastOrder, lastOrder] = orders.slice(orders.length -2) // returns second to last and last 
		log({secondLastOrder})
		log({lastOrder})
		// Get last order price
		const lastPrice = get(lastOrder, 'tokenPrice', 0)
		const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

		return({
			lastPrice,
			lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
			series: [{
				 data: buildGraphData(orders)
			}]
		})
	}
)

const buildGraphData = (orders) => {
	// Group orders by the hour
	orders = groupBy(orders, (o) => moment.unix(o.timeStamp).startOf('hour').format())  // returns an object with keys = value of the 'moment' function we passed. Keys are sorted ascending since they are numerical.
	// Get each hour that actually has orders
	const hours = Object.keys(orders)  // This will get an array made of the keys of, you will get as values an array with the orders from that hour.
	// Build the graph series
	const graphData = hours.map((hour) => {
		// Fetch all the orders from current hour
		const group = orders[hour] // Note: the hours are already sored in ascending order. Even if they were not already, groupBy does that.
		// Calculate price values: open, high, low and close from that hour
		const open = group[0] 					// first order
		const high = maxBy(group, 'tokenPrice') // order with the highest tokenPrice
		const low = minBy(group, 'tokenPrice')  // order with the lowest tokenPrice
		const close = group[group.length-1]   // last order
		return({
			x: new Date(hour),
			y:[open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
		})
	})
	return graphData
}