const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'

function tokens (_readableAmount) {
	return new web3.utils.BN(
		web3.utils.toWei(_readableAmount.toString(), 'ether'))
	}

function ether (_readableAmount) {
	return tokens(_readableAmount)
}


module.exports = {
	ETHER_ADDRESS,
	tokens,
	ether
}