import Web3 from 'web3'
import {
	web3Loaded,
	web3AccountLoaded,
	tokenLoaded,
	exchangeLoaded,
	cancelledOrdersLoaded,
	filledOrdersLoaded,
	allOrdersLoaded,
	orderCancelling,
	orderCancelled,
	orderFilling	
} from './actions'
import { log } from '../helpers'
import Token from '../abis/Token.json'
import Exchange from '../abis/Exchange.json'

export const loadWeb3 = async (dispatch) => {
	if (typeof window.ethereum !== 'undefined'){
		const web3 = new Web3(window.ethereum)
		dispatch(web3Loaded(web3))
		console.log(">>> Loaded Web3 from window.ethereum")
		return web3
	} else {
		window.alert('Please install MetaMask')
		window.location.assign("https://metamask.io/")
		console.log(">>> Error loading Web3")
	}
}

export const loadAccount = async (web3, dispatch) => {
	const accounts = await web3.eth.getAccounts()
	const account = accounts[0]
	if(typeof account !== 'undefined'){
	    dispatch(web3AccountLoaded(account))
	    return account
	} else {
	    window.alert('Please login with MetaMask')
	    return null
	}
}

export const loadToken = async (web3, networkId, dispatch) => {
	try {
		const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address)
		dispatch(tokenLoaded(token))
		console.log(">>> Token loaded at " + token._address)
		return token
	} catch (error) {
		console.log('Contract not deployed to the current network. Please select another network with Metamask.')
		return null
	}
}

export const loadExchange = async (web3, networkId, dispatch) => {
	try {
		const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address)
		dispatch(exchangeLoaded(exchange))
		console.log(">>> Exchange loaded at " + exchange._address)
		return exchange
	} catch (error) {
		console.log('Contract not deployed to the current network. Please select another network with Metamask.')
		return null
	}
}

// TODO: Can you refactor to only pass here exchange and dispatch? Get connection from the state via selector?
export const loadAllOrders = async (connection, exchange, dispatch) => { 
	// Fetch cancelled orders with the "Cancel" event stream
	const currentBlock = await connection.eth.getBlockNumber()
	//log({currentBlock})
	const startBlock = currentBlock - 1000
	const cancelStream = await exchange.getPastEvents('Cancel', { fromBlock: startBlock, toBlock: 'latest'})
	// Format cancelled orders
	const cancelledOrders = cancelStream.map((event) => event.returnValues)  // event.returnValues contains the actual orders
	// Add cancelled orders to the redux store
	dispatch(cancelledOrdersLoaded(cancelledOrders))

	// Fetch, format and dispatch filled orders with the "Trade" event stream
	const tradeStream = await exchange.getPastEvents('Trade', { fromBlock: startBlock, toBlock: 'latest'})
	const filledOrders = tradeStream.map((event) => event.returnValues)
	dispatch(filledOrdersLoaded(filledOrders))

	// Fetch all orders with the "Order" event stream
	const orderStream = await exchange.getPastEvents('Order', { fromBlock: startBlock, toBlock: 'latest'})
	const allOrders = orderStream.map((event) => event.returnValues)
	dispatch(allOrdersLoaded(allOrders))
}

export const subscribeToEvents = async (dispatch, exchange) => {
	exchange.events.Cancel({}, (error, event) =>{		// subscribe to the Cancel event of our exchange. We pass an empty filter as first parameter with {}.
														// we receive the event which includes the order that triggered the event
		dispatch(orderCancelled(event.returnValues))	// dispatch a new action to change the redux state and trigger UI update
	})
} 

export const cancelOrder = (dispatch, exchange, order, account) => {
	// Call cancelOrder on the exchange contract. Needs an order id passed to it an an account to verify ownership of the order.
	exchange.methods.cancelOrder(order.id).send({ from: account })
	.on('transactionHash', (hash) =>{
		// Create and dispatch an action so the UI gets updated accordingly
		dispatch(orderCancelling())
	})
	.on('error', (error) => {
		log({error})
		window.alert('There was an error cancelling the order!')
	})	
}

export const fillOrder = (dispatch, exchange, order, account) => {
	// Call cancelOrder on the exchange contract. Needs an order id passed to it an an account to verify ownership of the order.
	// exchange.methods.fillOrder(order.id).send({ from: account })
	// .on('transactionHash', (hash) =>{
	// 	// Create and dispatch an action so the UI gets updated accordingly
	// 	dispatch(orderFilling())
	// })
	// .on('error', (error) => {
	// 	log({error})
	// 	window.alert('There was an error filling the order!')
	// })	
	console.log("Hey, I am going to fill and Order")
}
