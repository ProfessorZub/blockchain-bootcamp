const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'
const EVM_REVERT = 'EVM reverted...'

function tokens (_readableAmount) {
	return new web3.utils.BN(web3.utils.toWei(_readableAmount.toString(), 'ether'))
}

function ether (_readableAmount) {
	return tokens(_readableAmount)
}

function trace (_varName, _varValue) {
	console.log(`${_varName} has value:\n ${_varValue}`)
}

function traceJSON(_varName, _varValue) {
	console.log(`${_varName} has value:\n ${JSON.stringify(_varValue, null, 2)}`)
}

module.exports = {
	ETHER_ADDRESS,
	tokens,
	ether,
	trace,
	EVM_REVERT,
	traceJSON
}