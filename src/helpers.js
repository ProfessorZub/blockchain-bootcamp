export const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000"
export const RED = 'danger'
export const GREEN = 'success'
export const DECIMALS = (10**18)

// Shortcut to avoid passing around web3 connection to calculate amounts in 'ether' instead of 'wei'
export const ether = (wei) => {
	if(wei) {
		return(wei / DECIMALS) // 18 decimal places
	}
}

// Tokens and ether have same decimal resolution so the same function will format tokens in natural units
export const tokens = ether