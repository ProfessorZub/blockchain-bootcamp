const { ETHER_ADDRESS } = require ('./helpers')


const Token = artifacts.require('./Token') 
const Exchange = artifacts.require('./Exchange') 

require('chai')
	.use(require('chai-as-promised'))
	.should()

contract('Exchange', ([_deployer, _feeAccount, _user1]) => { // passing parameters to the callback function so contract() can populate them with the accounts from Truffle
	// Helper functions that should go into helpers.js one day
	tokens = (_readableTokens) => {
	return new web3.utils.BN(
		web3.utils.toWei(_readableTokens.toString(), 'ether'))
	}

	let token
	let exchange
	const feePercent = 10

	beforeEach(async () => {
		// Deploy token
 		token = await Token.new()
 		// Transfer some tokens to _user1
 		token.transfer(_user1, tokens(100), {from: _deployer})	// when Token is deployed, the entire supply is transfered to the deployer (same deployer as in this contract)
 	 	// Deploy exchange
 	 	exchange = await Exchange.new(_feeAccount, feePercent)	
 	})

	describe('deployment ', () => {
		it('1 - tracks the fee account', async () => {
			const result = await exchange.feeAccount()
			result.should.equal(_feeAccount)
		})

		it('2 - tracks the fee percent', async () => {
			const result = await exchange.feePercent()
			result.toString().should.equal(feePercent.toString())
		})
	})   

	describe('depositing tokens ', () => {
		let result
		let amount

		

		describe('success', () => {
			beforeEach(async() => {
				amount = tokens(10)
				await token.approve(exchange.address, amount, {from: _user1})
				result = await exchange.depositToken(token.address, amount, {from: _user1})
			})

			it('3 - tracks the token deposit', async () => {
				// Check balance on exchange
				let balance
				balance = await token.balanceOf(exchange.address)
				balance.toString().should.equal(amount.toString())
				// Check balance on user
				balance = await exchange.tokens(token.address, _user1)
				balance.toString().should.equal(amount.toString())
			})

			it('4 - emits deposit events', async() => {
				const log = result.logs[0] 
				log.event.should.equal('Deposit')
				const event = log.args
				event.token.should.equal(token.address, 'token address logged is correct')
				event.user.should.equal(_user1, 'user account logged is correct')
				event.amount.toString().should.equal(amount.toString(), 'amount logged is correct')
				event.balance.toString().should.equal(amount.toString(), 'balance logged is correct')
			})
		})

		describe('failure', () => {
			it ('5 - fails to deposit when token is the Ether "token" (null address)', async () => {
				await exchange.depositToken('0x0000000000000000000000000000000000000000', amount, {from: _user1}).should.be.rejected
			})

			it ('6 - fails to deposit if token has not been approved', async () => {
				await exchange.depositToken(token.address, amount, {from: _user1}).should.be.rejected
			
			})		
		})		
	})   	
})