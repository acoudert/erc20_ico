//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./TestToken.sol";
import "./SafeMath.sol";

contract TestTokenSale {

	using SafeMath for uint;

	address private admin;
	TestToken public tokenContract;
	uint256 public tokenPrice;
	uint256 public tokenSold;

	event Sell(
		address _buyer,
		uint256 _amount
	);

	constructor(TestToken _tokenContract, uint256 _tokenPrice) {
		admin = msg.sender;
		tokenContract = _tokenContract;
		tokenPrice = _tokenPrice;
	}
	
	function buyTokens(uint256 _numberOfTokens) public payable {
		require(msg.value == _numberOfTokens.mul(tokenPrice), "Incorrect value");
		require(_numberOfTokens <= tokenContract.balanceOf(address(this)), "Not enough funds");
		require(tokenContract.transfer(msg.sender, _numberOfTokens), "Error");
		tokenSold += _numberOfTokens;
		emit Sell(msg.sender, _numberOfTokens);
	}

	function endSale(address payable _to) public {
		require(msg.sender == admin, "Only admin");
		require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
		selfdestruct(_to);

	}

}
