const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("Token & TokenFaucet", function () {
  let token, faucet;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("FaucetToken");
    token = await Token.deploy();
    await token.waitForDeployment();

    const Faucet = await ethers.getContractFactory("TokenFaucet");
    faucet = await Faucet.deploy(await token.getAddress());
    await faucet.waitForDeployment();

    await token.setFaucet(await faucet.getAddress());
  });

  it("should deploy token with correct max supply", async function () {
    expect(await token.MAX_SUPPLY()).to.equal(
      ethers.parseEther("1000000")
    );
  });

  it("should set deployer as admin", async function () {
    expect(await faucet.admin()).to.equal(owner.address);
  });

  it("should allow a user to claim tokens successfully", async function () {
    await faucet.connect(user1).requestTokens();
    expect(await token.balanceOf(user1.address)).to.equal(
      ethers.parseEther("100")
    );
  });

  it("should revert if user claims before cooldown ends", async function () {
    await faucet.connect(user1).requestTokens();
    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Cooldown period not elapsed");
  });

  it("should enforce lifetime claim limit", async function () {
    for (let i = 0; i < 5; i++) {
      await faucet.connect(user1).requestTokens();
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");
    }

    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Lifetime claim limit reached");
  });

  it("should not allow claims when faucet is paused", async function () {
    await faucet.setPaused(true);
    await expect(
      faucet.connect(user1).requestTokens()
    ).to.be.revertedWith("Faucet is paused");
  });

  it("should prevent non-admin from pausing faucet", async function () {
    await expect(
      faucet.connect(user1).setPaused(true)
    ).to.be.revertedWith("Only admin can pause");
  });

  it("should emit TokensClaimed event on successful claim", async function () {
    await expect(faucet.connect(user1).requestTokens())
      .to.emit(faucet, "TokensClaimed")
      .withArgs(
        user1.address,
        ethers.parseEther("100"),
        anyValue
      );
  });

  it("should return zero remaining allowance after max claim", async function () {
    for (let i = 0; i < 5; i++) {
      await faucet.connect(user1).requestTokens();
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
    }

    expect(
      await faucet.remainingAllowance(user1.address)
    ).to.equal(0);
  });

  it("should allow multiple users to claim independently", async function () {
    await faucet.connect(user1).requestTokens();
    await faucet.connect(user2).requestTokens();

    expect(await token.balanceOf(user1.address)).to.equal(
      ethers.parseEther("100")
    );
    expect(await token.balanceOf(user2.address)).to.equal(
      ethers.parseEther("100")
    );
  });
});
