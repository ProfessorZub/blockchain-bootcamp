// Contracts
const Token = artifacts.require("Token")
const Exchange = artifacts.require("Exchange")
const {tokens, ether, ETHER_ADDRESS} = require('../test/helpers.js')

module.exports = async function (callback) {
	// TODO: Fill me in ...	
	try {
		//D
		console.log("seed-exchange.js is running")
		//_D

		// Fetch accounts from wallet (these are unlocked)
		 const accounts = await web3.eth.getAccounts()

		// Fetch the deployed token
		 const token = await Token.deployed()
		 console.log("Token fetched at: ", token.address)

		// Fetch the deployed exchange 
		 const exchange = await Exchange.deployed()
		 console.log("Exchange fetched at: ", exchange.address)

		// Set up accounts
		 const sender = accounts[0]
		 const receiver = accounts[1]

		// Give tokens to accounts[1]
		 let amount = web3.utils.toWei('10000', 'ether')  // 10,000 tokens
		 await token.transfer(receiver, amount, {from: sender})
		 console.log(`Transferred ${amount} tokens from ${sender} to ${receiver}`)

		// Rename accounts for use with exchange
		 const user1 = accounts[0]
		 const user2 = accounts[1]

		// User 1 deposits Ether
		 amount = 1
		 await exchange.depositEther({from: user1, value: ether(amount) })
		 console.log(`Deposited ${amount} Ether from ${user1}`) 

		// User 2 approves and deposits tokens
		 amount = 10000
		 await token.approve(user2, tokens(amount))
		 console.log(`Approved ${amount} tokens from ${user2}`)
		 await exchange.depositToken(token.address, amount)
		 console.log(`Deposited ${amount} tokens from ${user2}`)

		////////////////////////////////////////
		// Seed a cancelled order 
		//

		// User 1 makes an order to get tokens in exchange for Ether
		 let result 
		 let orderID
		 result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), {from: user1})
		 console.log(`Made order from user ${user1} `)

		// User 1 cancels the order
		 orderID = result.logs[0].args.id
		 await exchange.cancelOrder(orderID, {from: user1})
		 console.log(`Cancelled order from user ${user1}`)

		////////////////////////////////////////
		// Seed filled orders
		//

		// User 1 makes an order to get tokens in exchange for Ether
		 result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), {from: user1})
		 console.log(`Made order from user ${user1} `)

		// User 2 fill the order
		 orderID = result.logs[0].args.id
		 await exchange.fillOrder(orderID, {from: user2})
		 console.log(`Filled order by user ${user2}`)

		// Wait 1 second
		 await wait(1)

		// User 1 makes another order 
		 result = await exchange.makeOrder(token.address, tokens(50), ETHER_ADDRESS, ether(0.01), {from: user1})
		 console.log(`Made order from user ${user1} `)

		// User 2 fills another order
		 orderID = result.logs[0].args.id
		 await exchange.fillOrder(orderID, {from: user2})
		 console.log(`Filled order by user ${user2}`)

		// Wait 1 second
		 await wait(1)

		// User 1 makes a final order
		 result = await exchange.makeOrder(token.address, tokens(200), ETHER_ADDRESS, ether(0.15), {from: user1})
		 console.log(`Made order from user ${user1} `)

		// User 2 fills final order
		 orderID = result.logs[0].args.id
		 await exchange.fillOrder(orderID, {from: user2})
		 console.log(`Filled order by user ${user2}`)

		// Wait 1 second
		 await wait(1)

		////////////////////////////////////////
		// Seed open orders
		//

		// User 1 makes 10 orders
		for (let i = 1; i <= 10; i++) {

		}

	} catch(error) {
		console.log(error)
	}
	callback()
}