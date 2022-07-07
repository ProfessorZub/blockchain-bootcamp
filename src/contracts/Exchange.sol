// Deposit and Withdraw Funds
// Manage Orders - Make or Cancel
// Handle Trades - Charge Fees

// TODO:
// [x] Set the fee and account to receive it
// [x] Deposit Ether
// [x] Withdraw Ether
// [x] Deposit tokens
// [x] Withdraw tokens
// [x] Check balances
// [x] Make order
// [x] Cancel order
// [x] Fill order
// [x] Charge fees
pragma solidity ^0.5.0;

import "./Token.sol";

contract Exchange {
	using SafeMath for uint256;

	// Variables
	address public feeAccount; // the account that receives exchange fees 
	uint256 public feePercent;
	address constant ETHER = address(0);  // trick so we can add Ether as another 'token'
	mapping(address => mapping(address => uint256)) public tokens; // mapping of tokens into mapping of users that hold a certain balance for that token
	mapping(uint256 => _Order) public orders;
	uint256 public orderCount;
	mapping(uint256 => bool) public orderCancelled;
	mapping(uint256 => bool) public orderFilled;

	// Events
		// D
		//event Fallback(string message);
		//_D
	event Deposit(
		address token,
	 	address user,
	 	uint256 amount,
	 	uint256 balance);

	event Withdraw(
		address token,
		address user,
		uint256 amount,
		uint256 balance);

	event Order (
		uint256 id,
		address user,
		address tokenGet,
		uint256 amountGet,
		address tokenGive,
		uint256 amountGive,
		uint256 timeStamp);

	event Cancel(
		uint256 id,
		address user,
		address tokenGet,
		uint256 amountGet,
		address tokenGive,
		uint256 amountGive,
		uint256 timeStamp);
	
	event Trade(
		uint256 id,
		address user,
		address tokenGet,
		uint256 amountGet,
		address tokenGive,
		uint256 amountGive,
		address userFill,
		uint256 timeStamp);
	
	// Types
	struct _Order {
		uint256 id;
		address user;
		address tokenGet;
		uint256 amountGet;
		address tokenGive;
		uint256 amountGive;
		uint256 timeStamp;
	}

	// TODO: Add orders to stotrage
	// TODO: Retrieve orders from storage


	constructor (address _feeAccount, uint256 _feePercent) public {
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}

	function depositEther() payable public {
		// Track Ether balance using same mapping variable as we use for ERC20 tokens
		tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
		// Emit event
		emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
	}

	function withdrawEther(uint _amount) public {
		require(tokens[ETHER][msg.sender] >= _amount);
		tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
		msg.sender.transfer(_amount);
		emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
	}

	function depositToken (address _token, uint _amount) public {
		// Don't allow Ether deposits with this function. There is another function for that purpose.
		require(_token != ETHER);
		// Send tokens to this contract (and stop if it returns false)
		require(Token(_token).transferFrom(msg.sender, address(this), _amount));
		// Manage deposit: update balance
		tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
		emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}

	function withdrawToken(address _token, uint _amount) public {
		// Don't allow Ether withdrawals with this function
		require(_token != ETHER);
		// Confirm balance is enough
		require(tokens[_token][msg.sender] >= _amount);
		// Send tokens to user
		tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
		// Update user balance
		require(Token(_token).transfer(msg.sender, _amount));
		emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}

	function balanceOf(address _token, address _user) public view returns (uint256) {
		return tokens[_token][_user];
	}

	function makeOrder(address _tokenGet, uint _amountGet,	address _tokenGive, uint _amountGive) public {
		orderCount = orderCount.add(1);
		orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
		emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
	}

	function cancelOrder(uint256 _id) public {
		_Order memory order = orders[_id];
		// The order must exist
		require(order.id == _id);
		// The owner of the order must match the user requesting the cancellation
		require(order.user == msg.sender);
		orderCancelled[_id] = true;
		// TODO: I don't think order count should go down with cancelled orders
		//orderCount = orderCount.sub(1);
		emit Cancel(_id, msg.sender, order.tokenGet, order.amountGet, order.tokenGive, order.amountGive, now);
	}

	function fillOrder(uint256 _id) public {
		require(_id > 0 && _id <= orderCount, "Order ID not valid.");
		require(!orderCancelled[_id], "This order was already cancelled.");
		require(!orderFilled[_id], "This order was already filled.");
		// Fetch order
		_Order memory order = orders[_id];
		_trade(order.id, order.user, order.tokenGet, order.amountGet, order.tokenGive, order.amountGive);
		// Mark order as filled
		 orderFilled[_id] = true;

	}

	function _trade(uint256 _id, address _user,	address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal {
		// Charge fees. Paid by the party fulfilling the order. Taken from the token they want to trade in (_tokenGet)
		// as a percentage of the amount they are going to receive (_amountGet). 
		uint256 feeAmount = _amountGet.mul(feePercent).div(100);		

		// Execute the trade		
		tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender].sub(_amountGet.add(feeAmount));
		tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender].add(_amountGive);
			// fee collected goes to the special account: feeAccount
		tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount].add(feeAmount);
		tokens[_tokenGet][_user] = tokens[_tokenGet][_user].add(_amountGet);
		tokens[_tokenGive][_user] = tokens[_tokenGive][_user].sub(_amountGive);

		// Emit Trade event
		emit Trade(_id, _user, _tokenGet, _amountGet, _tokenGive, _amountGive, msg.sender, now);
	}
		
	function () payable external {
		revert();
	}
}
