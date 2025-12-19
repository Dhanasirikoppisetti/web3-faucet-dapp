import { BrowserProvider, Contract } from "ethers";

export const FAUCET_TOKEN_ADDRESS = "0xa95d894039BC0F0cbC630A47D497FF1cf274cAfF";
export const TOKEN_FAUCET_ADDRESS = "0xF8EefC4eE8252b085370103c3CfC02e7C7B5FA3D";

import faucetTokenArtifact from "@artifacts/contracts/Token.sol/FaucetToken.json";
import tokenFaucetArtifact from "@artifacts/contracts/TokenFaucet.sol/TokenFaucet.json";

export const FAUCET_TOKEN_ABI = faucetTokenArtifact.abi;
export const TOKEN_FAUCET_ABI = tokenFaucetArtifact.abi;

export function getBrowserProvider() {
  if (!window.ethereum) throw new Error("MetaMask not found");
  
  console.log("window.ethereum exists:", !!window.ethereum);
  console.log("window.ethereum.chainId:", window.ethereum.chainId);
  
  const provider = new BrowserProvider(window.ethereum);
  
  provider.getNetwork().then(net => {
    console.log("BrowserProvider detected chainId:", net.chainId.toString());
    console.log("BrowserProvider detected name:", net.name);
  });
  
  return provider;
}

export async function getFaucetWithSigner() {
  const provider = getBrowserProvider();
  const signer = await provider.getSigner();
  return new Contract(TOKEN_FAUCET_ADDRESS, TOKEN_FAUCET_ABI, signer);
}

export async function getTokenBalance(address) {
  const provider = getBrowserProvider();
  const token = new Contract(FAUCET_TOKEN_ADDRESS, FAUCET_TOKEN_ABI, provider);
  const bal = await token.balanceOf(address);
  return bal.toString();
}

export async function getRemainingAllowance(address) {
  const provider = getBrowserProvider();
  const faucet = new Contract(TOKEN_FAUCET_ADDRESS, TOKEN_FAUCET_ABI, provider);
  const rem = await faucet.remainingAllowance(address);
  return rem.toString();
}

export async function getCooldownStatus(address) {
  const provider = getBrowserProvider();
  const faucet = new Contract(TOKEN_FAUCET_ADDRESS, TOKEN_FAUCET_ABI, provider);

  const last = await faucet.lastClaimAt(address);
  const cooldownSeconds = 60;

  const nowSec = Math.floor(Date.now() / 1000);
  const secondsSince = nowSec - Number(last);
  const secondsLeft = cooldownSeconds - secondsSince;

  if (!last || secondsLeft <= 0) {
    return { ready: true, secondsLeft: 0 };
  }
  return { ready: false, secondsLeft };
}
