import hre from "hardhat";

async function main() {
  console.log("Deploying contracts...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy Token
  const FaucetToken = await hre.ethers.getContractFactory("FaucetToken");
  const token = await FaucetToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("FaucetToken deployed to:", tokenAddress);

  // Deploy Faucet
  const TokenFaucet = await hre.ethers.getContractFactory("TokenFaucet");
  const faucet = await TokenFaucet.deploy(tokenAddress);
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log("TokenFaucet deployed to:", faucetAddress);

  // Check token total supply
  const totalSupply = await token.totalSupply();
  console.log("Token total supply:", hre.ethers.formatEther(totalSupply));

  // Transfer tokens to faucet
  console.log("Transferring tokens to faucet...");
  const transferAmount = hre.ethers.parseEther("10000");
  const transferTx = await token.transfer(faucetAddress, transferAmount);
  console.log("Transfer tx sent:", transferTx.hash);
  await transferTx.wait();
  console.log("Transferred 10,000 tokens to faucet");

  // Verify faucet balance
  const faucetBalance = await token.balanceOf(faucetAddress);
  console.log("Faucet token balance:", hre.ethers.formatEther(faucetBalance));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
