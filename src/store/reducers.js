import { combineReducers } from 'redux'

function web3(state = {}, action) {
	switch (action.type) {
		case 'WEB3_LOADED':
			return {...state, connection: action.connection}
		case 'WEB3_ACCOUNT_LOADED':
			return {...state, account: action.account}
		default:
			return state
	}
}

function token(state = {}, action) {
	switch (action.type) {
		case 'TOKEN_LOADED':
			return {...state, contract: action.contract}
		default:
			return state
	}
}

function exchange(state = {}, action) {
	switch (action.type) {
		case 'EXCHANGE_LOADED':
			return {...state, contract: action.contract}
		default:
			return state
	}
}

const rootReducer = combineReducers({
	web3,		// This is ES6 for web3: web3 (object where keys have the same names as the variables passed-in as properties)
	token,
	exchange
})

export	default rootReducer