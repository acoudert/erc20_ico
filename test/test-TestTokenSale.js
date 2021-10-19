const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TestTokenSale", _ => {

	let Token, token, TokenContract, tokenContract, owner, addr1, addr2, addrs;
	const initialSupply = 1000000;
	const tokenPrice = 10000000000000000;
	const transferedTokens = 10000;

	beforeEach(async function() {
		TokenContract = await ethers.getContractFactory("TestToken");
		tokenContract = await TokenContract.deploy(initialSupply);
		Token = await ethers.getContractFactory("TestTokenSale");
		token = await Token.deploy(tokenContract.address, tokenPrice.toString());
		await tokenContract.transfer(token.address, transferedTokens);
		[owner, addr1, addr2, ...addrs] = await ethers.getSigners();
	});

	describe("Constructor", _ => {
		it("Token address != 0", async function() {
			expect(token.address).to.not.equal(0x0);
		});
		it("Token Contract address != 0", async function() {
			expect(await token.tokenContract().address).to.not.equal(0x0);
		});
		it("Token price to be ", async function() {
			let n = await token.tokenPrice();
			expect(n.toString()).to.equal(tokenPrice.toString());
		});
	});

	describe("BuyToken", _ => {
		it("Should buy tokens", async function() {
			await token.connect(addr1).buyTokens(1, {value : tokenPrice.toString()})
			expect(await tokenContract.balanceOf(addr1.address)).to.equal(1);
			expect(await tokenContract.balanceOf(token.address)).to.equal(transferedTokens - 1);
			expect(await token.tokenSold()).to.equal(1);
		});
		it("Should emit Sell event", async function() {
			await expect(token.buyTokens(1, {value : tokenPrice.toString()}))
				.to.emit(token, "Sell").withArgs(owner.address, 1);
		});
		it("Should be reverted", async function() {
			await expect(token.buyTokens(1, {value : (tokenPrice + 10).toString()}))
				.to.be.revertedWith("Incorrect value");
			await expect(token.buyTokens(10001, {value : (tokenPrice * 10001).toString()}))
				.to.be.revertedWith("Not enough funds");
		});
	});

	describe("EndSale", _ => {
		it("Should be reverted", async function() {
			await expect(token.connect(addr1).endSale(addr1.address)).to.be.revertedWith("Only admin");
		});
		it("Should reset", async function() {
			await token.endSale(owner.address);
			await expect(token.tokenPrice()).to.be.reverted;
		});
	});
});
