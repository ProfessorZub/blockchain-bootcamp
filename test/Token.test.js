// Helper functions are defined in helpers.js.
// But doesn't really work. Lost too much time trying to figure it out
// import { tokens } from './helpers'

// We are going to use Truffle to run the tests
const Token = artifacts.require('./Token') // Is ./ needed? this test file is not in the same folder as the abis/

// Import chai library elements to help us write the tests
require('chai')
.use(require('chai-as-promised'))
.should()

contract('Token', ([deployer, receiver, exchange]) => { // passing parameters to the callback function so contract() can populate them with the accounts from Truffle
	// Helper functions that should go into helpers.js one day
	tokens = (_readableTokens) => {
	return new web3.utils.BN(
		web3.utils.toWei(_readableTokens.toString(), 'ether'))
	}

	const name = 'Magic Token'
	const symbol = 'MAGG'
	const decimals = '18'
	const totalSupply = tokens (1000000)
	const EVM_REVERT = 'VM Exception while processing transaction: revert' // not using this. May be outdated
	let token

	beforeEach(async () => {
		// Fetch token from blockchain
 		token = await Token.new()
 	})

	describe('deployment ', () => {
		it('1 - tracks the name', async () => {
			// Read token name here...
			const result = await token.name()
			// Check that it matches what we entered in the .sol file: "My Namo"
			result.should.equal(name)
		})

		it('2 - tracks the symbol', async () => {
			const result = await token.symbol()
			result.should.equal(symbol)
		})

		it('3 - tracks the decimals', async () => {
			const result = await token.decimals()
			result.toString().should.equal(decimals)
		})

		it('4 - tracks the total supply', async () => {
			const result = await token.totalSupply()
			result.toString().should.equal(totalSupply.toString())
		})

		it('5 - assigns the total supply to the deployer of the contract', async () => {
			const result = await token.balanceOf(deployer)
			result.toString().should.equal(totalSupply.toString())
		})
	})

	describe('sending tokens', () => {
		let amount
		let result

		describe('success', () => {
			beforeEach(async () => {
				amount = tokens (100)
				result = await token.transfer(receiver, amount, { from: deployer })
			})

			it('6 - transfers token balances', async() => {
				let balanceOf

				balanceOfReceiver = await token.balanceOf(receiver)
				balanceOfReceiver.toString().should.equal(tokens(100).toString())
				balanceOfDeployer = await token.balanceOf(deployer)
				balanceOfDeployer.toString().should.equal(tokens(999900).toString())
			})

			it('7 - emits Transfer events', async() => {
				const log = result.logs[0] // logs is an array but only has one item in this case
				log.event.should.equal('Transfer')
				const event = log.args
				event.from.toString().should.equal(deployer, 'from is correct')
				event.to.toString().should.equal(receiver, 'receiver is correct')
				event.value.toString().should.equal(amount.toString())
			})
		})

		describe('failure', () => {
			it ('8 - rejects insufficient balance for the transfer', async () => {
				let invalidAmount
				invalidAmount = tokens(100000000) // 100 million is greater than total supply
				await token.transfer(receiver, invalidAmount, { from: deployer}).should.be.rejected
			
				invalidAmount = tokens(10) // This one is invalid because receiver should not have any tokens
				await token.transfer(deployer, invalidAmount, { from: receiver}).should.be.rejected
			})

			it ('9 - rejects invalid address', async () => {
				let invalidAddess = 0x0   // This is the only invalid address we check for
				await token.transfer(invalidAddess, tokens(100), { from: deployer}).should.be.rejected
			})

		})

	})	

	describe('approving tokens', () => {
		let result
		let amount

		describe('success', () => {
			beforeEach(async () => {
				amount = tokens(100)
				result = await token.approve(exchange, amount, {from: deployer})
		})

			it('10 - allocates an allowance for delegated token spending', async() => {
				const allowance = await token.allowance(deployer, exchange)
				allowance.toString().should.equal(amount.toString())
			})

			it('11 - emits Approval events', async() => {
				const log = result.logs[0] // logs is an array but only has one item in this case
				log.event.should.equal('Approval')
				const event = log.args
				event.owner.toString().should.equal(deployer, 'owner is correct')
				event.spender.toString().should.equal(exchange, 'spender is correct')
				event.value.toString().should.equal(amount.toString())
			})

		})

		describe('failure', () => {
			it ('12 - rejects invalid address', async () => {
				let invalidAddess = 0x0   // This is the only invalid address we check for
				await token.transfer(invalidAddess, tokens(100), { from: deployer}).should.be.rejected
			})
		})
	})

	describe('delegated token transfers', () => {
	    let result
	    let amount

	    beforeEach(async () => {
	      amount = tokens(100)
	      await token.approve(exchange, amount, { from: deployer })
	    })

	    describe('success', () => {
	    	beforeEach(async () => {
				amount = tokens (100)
				result = await token.transferFrom(deployer, receiver, amount, { from: exchange })
			})

			it('13 - transfers token balances', async() => {
				let balanceOf

				balanceOfReceiver = await token.balanceOf(receiver)
				balanceOfReceiver.toString().should.equal(tokens(100).toString())
				balanceOfDeployer = await token.balanceOf(deployer)
				balanceOfDeployer.toString().should.equal(tokens(999900).toString())
			})

			it('14 - emits Transfer events', async() => {
				const log = result.logs[0] // logs is an array but only has one item in this case
				log.event.should.equal('Transfer')
				const event = log.args
				event.from.toString().should.equal(deployer, 'from is correct')
				event.to.toString().should.equal(receiver, 'receiver is correct')
				event.value.toString().should.equal(amount.toString())
			})

			it('15 - resets the allowance for delegated token spending', async() => {
				const allowance = await token.allowance(deployer, exchange)
				allowance.toString().should.equal('0')
			})
	    })

	    describe('failure', () => {
	    	it('16 - rejects insufficient allowance', async ()  => {
	    		// Only approved for 100 tokens so attempting to send 1000 should be rejected
	    		await token.transferFrom(deployer, receiver, tokens(1000), { from: exchange }).should.be.rejected
	    	})

	    	it('17 - rejects invalid recipient address', async ()  => {
	    		// Only approved for 100 tokens so attempting to send 1000 should be rejected
	    		await token.transferFrom(deployer, 0x0, tokens(100), { from: exchange }).should.be.rejected
	    	})

	    	it('18 - rejects sending tokens if not approved to do so', async () => {
	    		// This should not work because exchange was approved to transfer from "deployer" balance but not "receiver"
	    		await token.transferFrom(receiver, deployer, tokens(100), { from: exchange }).should.be.rejected
	    	})
	    })
	})    
})