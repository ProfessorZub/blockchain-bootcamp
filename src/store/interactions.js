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
	orderFilling,
	orderFilled,
	etherBalanceLoaded,
	tokenBalanceLoaded,
	exchangeEtherBalanceLoaded,
	exchangeTokenBalanceLoaded,
	balancesLoading,
	balancesLoaded,
	buyOrderMaking,
	sellOrderMaking,
	orderMade	
} from './actions'
import { log } from '../helpers'
import Token from '../abis/Token.json'
import Exchange from '../abis/Exchange.json'
import { ETHER_ADDRESS } from '../helpers'

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
		console.log('Contract not deployed to the current network. Please select another network with Metamask.', error)
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

export const loadAllOrders = async (connection, exchange, dispatch) => { 
	// Fetch cancelled orders with the "Cancel" event stream

	// <DEBUG: This was a workaround for Ganache hanging when getting events from block 0. Do I need it in Kovan?
	// const currentBlock = await connection.eth.getBlockNumber()
	// //log({currentBlock})
	// const startBlock = currentBlock - 1000
	// </DEBUG>

	const startBlock = 0
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

export const subscribeToEvents = async (dispatch, web3, exchange, token, account) => {
	exchange.events.Cancel({}, (error, event) =>{		// subscribe to the Cancel event of our exchange. We pass an empty filter as first parameter with {}.
														// we receive the event which includes the order that triggered the event
		dispatch(orderCancelled(event.returnValues))	// dispatch a new action to change the redux state and trigger UI update
	})
	
	exchange.events.Trade({}, (error, event) =>{		// subscribe to Trade events (any filled orders)
		dispatch(orderFilled(event.returnValues))
		loadBalances(dispatch, web3, exchange, token, account)		
	})
	
	exchange.events.Deposit({}, (error,event) =>{
		loadBalances(dispatch, web3, exchange, token, account)
	})
	
	exchange.events.Withdraw({}, (error,event) =>{
		loadBalances(dispatch, web3, exchange, token, account)
	})

	exchange.events.Order({}, (error,event) =>{			// Subscribe to Order events. Same event type for Buy and Sell orders
		dispatch(orderMade(event.returnValues))
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
	exchange.methods.fillOrder(order.id).send({ from: account })
	.on('transactionHash', (hash) =>{
		// Create and dispatch an action so the UI gets updated accordingly
		dispatch(orderFilling())
		dispatch(balancesLoading())
	})
	.on('error', (error) => {
		log({error})
		window.alert('There was an error filling the order!')
	})	
}

export const loadBalances = async (dispatch, web3, exchange, token, account) => {
	  if(typeof account !== 'undefined') {
	      // Ether balance in wallet
	      const etherBalance = await web3.eth.getBalance(account)
	      dispatch(etherBalanceLoaded(etherBalance))

	      // Token balance in wallet
	      const tokenBalance = await token.methods.balanceOf(account).call()
	      dispatch(tokenBalanceLoaded(tokenBalance))

	      // Ether balance in exchange
	      const exchangeEtherBalance = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call()
	      dispatch(exchangeEtherBalanceLoaded(exchangeEtherBalance))

	      // Token balance in exchange
	      const exchangeTokenBalance = await exchange.methods.balanceOf(token.options.address, account).call()
	      dispatch(exchangeTokenBalanceLoaded(exchangeTokenBalance))

	      // Trigger all balances loaded
	      dispatch(balancesLoaded())
	  } else {
	 	  window.alert('Please login with MetaMask')
	}
}

export const depositEther = (dispatch, exchange, web3, amount, token, account) => {	
	exchange.methods.depositEther().send({ from: account,  value: web3.utils.toWei(amount, 'ether') })
  	.on('transactionHash', (hash) => {
    dispatch(balancesLoading())
  	})
  	.on('error',(error) => {
    console.error(error)
    window.alert(`There was an error!`)
  	})
}

export const withdrawEther = (dispatch, exchange, web3, amount, token, account) => {
	exchange.methods.withdrawEther(web3.utils.toWei(amount, 'ether')).send({ from: account })
  	.on('transactionHash', (hash) => {
    dispatch(balancesLoading())
  	})
  	.on('error',(error) => {
    console.error(error)
    window.alert(`There was an error!`)
  	})
}

export const depositToken = (dispatch, exchange, web3, amount, token, account) => {
	console.log("TODO: intreactions -> depositToken()")
	// Approve exchange to spend the token calling the Token contract
	console.log("amount inside depositToken in intreactions:" + amount)
	amount = web3.utils.toWei(amount, 'ether')

	token.methods.approve(exchange.options.address, amount).send({from: account})
	.on('transactionHash', (hash) => {
		exchange.methods.depositToken(token.options.address, amount).send({from: account})
		.on('transactionHash', (hash) => {
			dispatch(balancesLoading())
		})
		.on('error', (error) => {
			console.error(error)
			window.alert(`There was an error depositing token!`)
		})
	})
}

export const withdrawToken = (dispatch, exchange, web3, amount, token, account) => {
	amount = web3.utils.toWei(amount, 'ether')
	exchange.methods.withdrawToken(token.options.address, amount).send({from: account})
	.on('transactionHash', (hash) => {
		dispatch(balancesLoading())
	})
	.on('error', (error) => {
		console.log(error)
		window.alert('There was an error withdrawing token!')
	})
}

// New Buy and Sell Orders
// Make Buy Order
export const makeBuyOrder = (dispatch, exchange, token, web3, order, account) => {
	// Format arguments needed to call makeOrder in Exchange contract
	// For a buy order, the token to get is MAGG and the token to give is ETH
	// Get address for tokens
	const tokenGiveAddress = ETHER_ADDRESS
	const tokenGetAddress = token.options.address

	// The amounts of tokens to get and give are determined by the amount and price entered in the buy order
	const tokenGetAmount = web3.utils.toWei(order.amount, 'ether')
	const tokenGiveAmount = web3.utils.toWei((order.amount * order.price).toString(),'ether')

	// Call makeOrder in Exchange contract
	exchange.methods.makeOrder(tokenGetAddress, tokenGetAmount, tokenGiveAddress, tokenGiveAmount).send({from: account})
	.on('transactionHash', hash => {
		dispatch(buyOrderMaking())
	})
	.on('error', error => {
		console.log(error)
		window.alert('There was an error making the buy order')
	})
}

// Make Sell Order
export const makeSellOrder = (dispatch, exchange, token, web3, order, account) => {
	// Format arguments needed to call makeOrder in Exchange contract
	// For a sell order, the token to get is ETH and the token to give is MAGG
	// Get address for tokens
	const tokenGiveAddress = token.options.address 
	const tokenGetAddress = ETHER_ADDRESS

	// The amounts of tokens to get and give are determined by the amount and price entered in the buy order
	const tokenGetAmount = web3.utils.toWei((order.amount * order.price).toString(),'ether')
	const tokenGiveAmount = web3.utils.toWei(order.amount, 'ether')

	// Call makeOrder in Exchange contract
	exchange.methods.makeOrder(tokenGetAddress, tokenGetAmount, tokenGiveAddress, tokenGiveAmount).send({from: account})
	.on('transactionHash', hash => {
		dispatch(sellOrderMaking())
	})
	.on('error', error => {
		console.log(error)
		window.alert('There was an error making the sell order')
	})
}