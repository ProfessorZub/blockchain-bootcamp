const { ETHER_ADDRESS, tokens, ether, trace, EVM_REVERT, traceJSON } = require ('./helpers')


const Token = artifacts.require('./Token') 
const Exchange = artifacts.require('./Exchange') 

require('chai')
	.use(require('chai-as-promised'))
	.should()

contract('Exchange', ([_deployer, _feeAccount, _user1]) => { // passing parameters to the callback function so contract() can populate them with the accounts from Truffle
	let token
	let exchange
	const feePercent = 10

	beforeEach(async () => {
		// Deploy token
 		token = await Token.new()
 		// Transfer some tokens to _user1
 		token.transfer(_user1, tokens(100), {from: _deployer})	// We give user1 some tokens from deployer (when Token is deployed, the entire supply is transfered to the deployer which is the same account as the deployer in this contract)
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
			it ('5 - fails to deposit when "token" is Ether (null address token)', async () => {
				await exchange.depositToken(ETHER_ADDRESS, amount, {from: _user1}).should.be.rejected
			})

			it ('6 - fails to deposit if token has not been approved', async () => {
				await exchange.depositToken(token.address, amount, {from: _user1}).should.be.rejected	
			})		
		})		
	})   

	describe('depositing Ether ', () => {
		let result
		let amount
		
		beforeEach(async() => {
		amount = ether(1)
		result = await exchange.depositEther({from: _user1, value: amount})		
		})

		it('7 - tracks the Ether deposit', async () => {
			// Check the ETH has been assigned to the user
			const balance = await exchange.tokens(ETHER_ADDRESS, _user1)
			balance.toString().should.equal(amount.toString())
		})

		it('8 - emits deposit events', async() => {
			const log = result.logs[0] 
			log.event.should.equal('Deposit')
			const event = log.args
			event.token.should.equal(ETHER_ADDRESS, 'token address logged is 0')
			event.user.should.equal(_user1, 'user account logged is correct')
			event.amount.toString().should.equal(amount.toString(), 'amount logged is correct')
			event.balance.toString().should.equal(amount.toString(), 'balance logged is correct')
		})
	})

	describe('fallback', async () => {
		it('9 - reverts when Ether is sent', async () => {
			// NOTE: Contract  does not need to refund user when receiving a send transaction of Ether because revert() will ensure they get it back (minus gas fees)

			// sendTransaction() does not seem to  be working to send Ether directly...
			// result = await exchange.sendTransaction({ value: ether(30), user: _user1 }).should.be.rejected
			// result = await exchange.sendTransaction({ value: ether(30), user: _user1 })

			//D - If you remove the revert() in the contract you can see the fallback function is being called with a test Event
			// const userBalanceBefore = await web3.eth.getBalance(_user1)
			// trace("_user1",_user1)
			// trace("userBalanceBefore", web3.utils.fromWei(userBalanceBefore, 'ether'))
			 await exchange.send(ether(30), {from: _user1}).should.be.rejected
			// await exchange.send(ether(30), {from: _user1})
			// const userBalanceAfter = await web3.eth.getBalance(_user1)
			// trace("userBalanceAfter", web3.utils.fromWei(userBalanceAfter, 'ether'))
			// const log = result.logs[0]
			// traceJSON("log", log)
			// const event = log.args
			// traceJSON("event", event)
			// log.event.should.equal('Fallback')
			// event.message.should.equal('Fallback was called')
			//_D
		})
	})  

	describe('withdrawing Ether ', () => {
		let result
		let amount
		
		beforeEach(async() => {
			amount = ether(1)
			await exchange.depositEther({from: _user1, value: amount})	
			result = await exchange.withdrawEther(amount, {from: _user1})
		})

		describe('success', async () => {
			it('10 - withdraws Ether', async () => {
				const balance = await exchange.tokens(ETHER_ADDRESS, _user1)
				balance.toString().should.equal('0')
				// TODO: did the user actually get their Ether? Need to implement a send from the exchnage
			})

			it('11 - emits withdraw events', async() => {
				const log = result.logs[0] 
				log.event.should.equal('Withdraw')
				const event = log.args
				event.token.should.equal(ETHER_ADDRESS, 'token address logged is 0')
				event.user.should.equal(_user1, 'user account logged is correct')
				event.amount.toString().should.equal(amount.toString(), 'amount logged is correct')
				event.balance.toString().should.equal('0', 'balance logged is correct')
			})
		})

		describe('failure', async () => {
			it('12 - rejects withdraw for insuficient balance', async () => {
				await exchange.withdrawEther(ether(100)).should.be.rejected
			})
		})
	})

	describe('withdrawing tokens ', () => {
		let result
		let amount

		beforeEach(async() => {
			amount = tokens(13)
			await token.approve(exchange.address, amount, {from: _user1})
			await exchange.depositToken(token.address, amount, {from: _user1})
			result = await exchange.withdrawToken(token.address, amount, {from: _user1})	
		})

		describe('success', () => {

			it('13 - withdraws tokens', async () => {
				// Check balance on exchange
				let balance
				balance = await token.balanceOf(exchange.address)
				balance.toString().should.equal('0')

				// Check balance on user
				balance = await exchange.tokens(token.address, _user1)
				balance.toString().should.equal('0')
			})

			it('14 - emits withdraw events', async() => {
				const log = result.logs[0] 
				log.event.should.equal('Withdraw')
				const event = log.args
				event.token.should.equal(token.address, 'token address logged is correct')
				event.user.should.equal(_user1, 'user account logged is correct')
				event.amount.toString().should.equal(amount.toString(), 'amount logged is correct')
				event.balance.toString().should.equal('0', 'balance logged is correct')
			})
		})

		describe('failure', () => {
			it ('15 - rejects withdraw for insuficient balance', async () => {
				await exchange.withdrawToken(token.address, tokens(1), {from: _user1}).should.be.rejected
			})	

			it ('16 - rejects withdraw for Ether "token"', async () => {
				await exchange.withdrawToken(ETHER_ADDRESS, tokens(1), {from: _user1}).should.be.rejected
			})
		})		
	}) 

})