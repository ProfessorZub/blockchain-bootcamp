const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'

function tokens (_readableAmount) {
	return new web3.utils.BN(web3.utils.toWei(_readableAmount.toString(), 'ether'))
}

function ether (_readableAmount) {
	return tokens(_readableAmount)
}

function log (_varName, _varValue) {
	console.log(`${_varName} has value:\n ${_varValue}`)
}

module.exports = {
	ETHER_ADDRESS,
	tokens,
	ether,
	log
}