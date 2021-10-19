const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TestToken", _ => {

	let Token, token, owner, addr1, addr2, addrs;
	const initialSupply = 1000000;


	beforeEach(async function() {
		Token = await ethers.getContractFactory("TestToken");
		token = await Token.deploy(initialSupply);
		[owner, addr1, addr2, ...addrs] = await ethers.getSigners();
	});

	describe("Constructor", _ => {
		it("Should set name as \"TestToken\"", async function() {
			expect(await token.name()).to.equal("TestToken");
		});
		it("Should set symbol as \"TT\"", async function() {
			expect(await token.symbol()).to.equal("TT");
		});
		it("Should set totalSupply as initialSupply", async function() {
			expect(await token.totalSupply()).to.equal(initialSupply);
		});
		it("Should set ownerBalance as initialSupply", async function() {
			expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
		});
	});

	describe("Transfer", _ => {
		it("Should be reverted", async function() {
			await expect(token.transfer(addr1.address, 100000000000))
				.to.be.revertedWith("Not enough funds");
		});
		it("Should deduct amount from owner", async function() {
			await token.transfer(addr1.address, 1000);
			expect(await token.balanceOf(owner.address)).to.equal(initialSupply - 1000);
		});
		it("Should add amount to owner", async function() {
			await token.transfer(addr1.address, 1000);
			expect(await token.balanceOf(addr1.address)).to.equal(1000);
		});
		it("Should emit a Transfer event", async function() {
			await expect(token.transfer(addr1.address, 1000))
				.to.emit(token, "Transfer").withArgs(owner.address, addr1.address, 1000);
		});
		it("Should return true", async function() {
			expect(await token.callStatic.transfer(addr1.address, 1000)).to.equal(true);
		});
	});

	describe("Approve", _ => {
		it("Should approve for delegated transfer", async function() {
			expect(await token.callStatic.approve(addr1.address, 1000)).to.equal(true);
		});
		it("Should emit Approval event", async function () {
			await expect(token.approve(addr1.address, 1000))
				.to.emit(token, "Approval").withArgs(owner.address, addr1.address, 1000);
		})
		it("Should set allowance from owner as spender to 1000", async function() {
			await token.approve(addr1.address, 1000);
			expect(await token.allowance(owner.address, addr1.address)).to.equal(1000);
		});
	});

	describe("TransferFrom", _ => {
		it("Should be reverted", async function() {
			await token.approve(addr1.address, 10);
			await expect(token.transferFrom(owner.address, addr1.address, 100))
				.to.be.revertedWith("Not enough funds in allowance");
		});
		it("Should be reverted", async function() {
			await token.approve(addr1.address, 100000000);
			await expect(token.connect(addr1)
					.transferFrom(owner.address, addr1.address, 10000001))
				.to.be.revertedWith("Value greater than balance");
		});
		it("Should update balanceOfs and allowance", async function() {
			await token.approve(addr1.address, 1000);
			await token.connect(addr1).transferFrom(owner.address, addr1.address, 100)
			expect(await token.balanceOf(owner.address)).to.equal(initialSupply - 100);
			expect(await token.balanceOf(addr1.address)).to.equal(100);
			expect(await token.allowance(owner.address, addr1.address)).to.equal(900);
		});
		it("Should emit Transfer event", async function () {
			await token.approve(addr1.address, 1000);
			await expect(token.connect(addr1).transferFrom(owner.address, addr1.address, 100))
				.to.emit(token, "Transfer").withArgs(owner.address, addr1.address, 100);
		})
	});
});
