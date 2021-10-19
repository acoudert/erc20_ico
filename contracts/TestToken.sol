//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract TestToken {

	string public name = "TestToken";
	string public symbol = "TT";
	uint256 public totalSupply;
	mapping(address => uint256) public balanceOf;
	mapping(address => mapping(address => uint256)) public allowance;

	event Transfer(
		address indexed _from,
		address indexed _to,
		uint256 _value
	);
	event Approval(
		address indexed _owner,
		address indexed _spender,
		uint256 _value
	);

	constructor(uint256 _initialSupply) {
		totalSupply = _initialSupply;
		balanceOf[msg.sender] = _initialSupply;
	}

	function transfer(address _to, uint256 _value) public returns(bool) {
		require(balanceOf[msg.sender] >= _value, "Not enough funds");
		balanceOf[msg.sender] -= _value;
		balanceOf[_to] += _value;
		emit Transfer(msg.sender, _to, _value);
		return true;
	}

	function approve(address _spender, uint _value) public returns(bool) {
		allowance[msg.sender][_spender] = _value;
		emit Approval(msg.sender, _spender, _value);
		return true;
	}

	function transferFrom(address _from, address _to, uint256 _value) public returns(bool) {
		require(allowance[_from][msg.sender] >= _value, "Not enough funds in allowance");
		require(balanceOf[_from] >= _value, "Value greater than balance");
		allowance[_from][msg.sender] -= _value;
		balanceOf[_from] -= _value;
		balanceOf[_to] += _value;
		emit Transfer(_from, _to, _value);
		return true;
	}
}
