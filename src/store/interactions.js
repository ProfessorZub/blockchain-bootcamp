import Web3 from 'web3'
import {
	web3Loaded,
	web3AccountLoaded,
	tokenLoaded,
	exchangeLoaded	
} from './actions'
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

export const loadAllOrders = async (exchange, dispatch) => {
	// Fetch cancelled orders with the "Cancel" event stream
	const cancleStream = await exchange.getPastEvents('Cancel', { fromBlock: 'latest', toBlock: 'latest'})
	console.log(">>> Cancel Stream: " + cancleStream)
	// Fetch filled orders with the "Trade" event stream

	// Fetch all orders with the "Order" event stream
}