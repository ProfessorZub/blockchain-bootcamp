const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'

function tokens (_readableTokens) {
	return new web3.utils.BN(
		web3.utils.toWei(_readableTokens.toString(), 'ether'))
	}

module.exports = {
	ETHER_ADDRESS,
	tokens
}