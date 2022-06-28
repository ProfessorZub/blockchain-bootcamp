// Deposit and Withdraw Funds
// Manage Orders - Make or Cancel
// Handle Trades - Charge Fees

// TODO:
// [x] Set the fee and account to receive it
// [] Deposit Ether
// [] Withdraw Ether
// [] Deposit tokens
// [] Withdraw tokens
// [] Check balances
// [] Make order
// [] Cancel order
// [] Fill order
// [] Charge fees
pragma solidity ^0.5.0;

import "./Token.sol";

contract Exchange {
	using SafeMath for uint;

	// Variables
	address public feeAccount; // the account that receives exchange fees 
	uint256 public feePercent;
	address constant ETHER = address(0);  // trick so we can add Ether as another 'token'
	mapping(address => mapping(address => uint256)) public tokens; // mapping of tokens into mapping of users that hold a certain balance for that token

	// Events
	event Deposit(address token, address user, uint256 amount, uint256 balance);

	constructor (address _feeAccount, uint256 _feePercent) public {
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}

	function depositEther() payable public {
		// How much? msg.value
		// Track Ether balance using same mapping variable as we use for ERC20 tokens
		tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
		// Emit event
		emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
	}

	function depositToken (address _token, uint _amount) public {
		// Which token? _token
		// How much? _amount
		// Don't allow Ether deposits with this function. There is another function for that purpose.
		require(_token != ETHER);
		// Send tokens to this contract (and stop if it returns false)
		require(Token(_token).transferFrom(msg.sender, address(this), _amount));
		// Manage deposit: update balance
		tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
		// Emit event
		emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}
}
