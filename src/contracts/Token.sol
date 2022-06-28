pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Token {
	using SafeMath for uint256;

	// Variables

	string public name	= "Magic Token";
	string public symbol = "MAGG";
	uint256 public decimals = 18;
	uint256 public totalSupply;
	mapping(address => uint256) public balanceOf; // mapping type is similar to a dictionary type. Each address will have a certain uint256 amount of tokens
	mapping(address => mapping(address => uint256)) public allowance; // for each address, there will be a list of exchanges (addresses) that have received approval for a certain allowance of tokens they can transfer

	// Events
	event Transfer(address indexed from, address indexed to, uint256 value);
	event Approval(address indexed owner, address indexed spender, uint256 value);

	constructor() public {
		totalSupply = 1000000 * (10 ** decimals);
		// The address that deploys this contract gets all the tokens.
		// Nobody else will be able to call the constructor once contract is deployed
		balanceOf[msg.sender] = totalSupply;
	}

	function transfer(address _to, uint256 _value) public returns (bool success) {
		
		// Check if sender has enough funds. 
		require(balanceOf[msg.sender] >= _value);

		_transfer(msg.sender, _to, _value);
		return true;
	}

	function approve(address _spender, uint256 _value) public returns (bool success) {
		require(_spender != address(0));
		allowance[msg.sender][_spender] = _value;
		emit Approval(msg.sender, _spender, _value);
		return true;
	}

	function transferFrom(address _from, address _to, uint256 _value) public returns(bool success) {
		// Check for allowance being enough
		// This also checks for account being approved because if not, allowance would be zero?
		require(allowance[_from][msg.sender] >= _value);
		// Check that the _from address has enough balance
		require(balanceOf[_from] >= _value);

		_transfer(_from, _to, _value);
		// Reset allowance
		allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
		return true;
	}

	function _transfer(address _from, address _to, uint256 _value) internal returns (bool success) {
		// Check if adderss is valid. Halt and throw VM Exception if not
		require(_to != address(0));
		balanceOf[_from] = balanceOf[_from].sub(_value);
		balanceOf[_to] = balanceOf[_to].add(_value);
		emit Transfer(_from, _to, _value);
		return true;
	}	
}