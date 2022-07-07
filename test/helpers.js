const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'
const EVM_REVERT = 'EVM reverted...'


// -- SETUP & WEB3 -- //
// TODO: I did not need this section until I tried to run scripts with truffle exec and it couldn't find web3
const Web3 = require('web3')
let web3 = new Web3('ws://127.0.0.1:8545')
// -- -- //

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

function wait(_seconds) {
	let promise = new Promise((resolve, reject) => {
		const milliseconds = _seconds * 1000
		setTimeOut(() => resolve("done"), milliseconds)
		return promise
	})
}

//function (_seconds) { let promise = New Promise(function(resolve, reject){const milliseconds = _seconds * 1000;	setTimeOut(() => resolve("done"), milliseconds);return promise})}

module.exports = {
	ETHER_ADDRESS,
	tokens,
	ether,
	trace,
	EVM_REVERT,
	traceJSON,
	wait
}