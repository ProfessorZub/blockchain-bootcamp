// WEB3
export function web3Loaded(connection) {
	return {
		type: 'WEB3_LOADED',
		connection: connection
	}
}

export function web3AccountLoaded(account) {
	return {
		type: 'WEB3_ACCOUNT_LOADED',
		account    // Same as account: account
	}
}

// TOKEN
export function tokenLoaded(contract) {
	return {
		type: 'TOKEN_LOADED',
		contract
	}
}

// EXCHANGE
export function exchangeLoaded(contract) {
	return {
		type: 'EXCHANGE_LOADED',
		contract
	}
}

// ORDERS
export function cancelledOrdersLoaded(cancelledOrders) {
	return {
		type: 'CANCELLED_ORDERS_LOADED',
		cancelledOrders
	}
}

export function filledOrdersLoaded(filledOrders) {
	return {
		type: 'FILLED_ORDERS_LOADED',
		filledOrders
	}
}

export function allOrdersLoaded(allOrders) {
	return {
		type: 'ALL_ORDERS_LOADED',
		allOrders
	}
}

// Cancel Order
export function orderCancelling() {
	return {
		type: 'ORDER_CANCELLING'
	}
}

// Order was cancelled
export function orderCancelled(order) {
	return {
		type: 'ORDER_CANCELLED',
		order 
	}
}

// Fill Order
export function orderFilling() {
	return {
		type: 'ORDER_FILLING'
	}
}

// Order was filled
export function orderFilled(order) {
	return {
		type: 'ORDER_FILLED',
		order 
	}
}

// Ether balance from wallet was loaded
export function etherBalanceLoaded(balance) {
	return {
		type: 'ETHER_BALANCE_LOADED',
		balance
	}
}

// Token balance from wallet was loaded
export function tokenBalanceLoaded(balance) {
	return {
		type: 'TOKEN_BALANCE_LOADED',
		balance
	}
}

// Ether balance from exchange was loaded
export function exchangeEtherBalanceLoaded(balance) {
	return {
		type: 'EXCHANGE_ETHER_BALANCE_LOADED',
		balance
	}
}

// Token balance from exchange was loaded
export function exchangeTokenBalanceLoaded(balance) {
	return {
		type: 'EXCHANGE_TOKEN_BALANCE_LOADED',
		balance
	}
}

// All balances were loaded
export function balancesLoaded() {
	return {
		type: 'BALANCES_LOADED'
	}
}

// Balances are loading
export function balancesLoading() {
	return {
		type: 'BALANCES_LOADING'
	}
}

// Deposits
export function etherDepositAmountChanged(amount) {
	return {
		type: 'ETHER_DEPOSIT_AMOUNT_CHANGED',
		amount
	}
}

export function tokenDepositAmountChanged(amount) {
	return {
		type: 'TOKEN_DEPOSIT_AMOUNT_CHANGED',
		amount
	}
}

// Withdrawals
export function etherWithdrawAmountChanged(amount) {
	return {
		type: 'ETHER_WITHDRAW_AMOUNT_CHANGED',
		amount
	}
}