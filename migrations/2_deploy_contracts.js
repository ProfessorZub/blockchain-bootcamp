const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");

module.exports = async function (_deployer) {
	// get the accounts provided by Ganache
	const accounts = await web3.eth.getAccounts();
	// use first account for collecting fees
	const feeAccount = accounts[0];
	const feePercent = 10;

	await _deployer.deploy(Token);
	await _deployer.deploy(Exchange, feeAccount, feePercent);
};