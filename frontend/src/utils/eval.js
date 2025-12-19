import {
  getBrowserProvider,
  getFaucetWithSigner,
  getTokenBalance,
  getRemainingAllowance,
  FAUCET_TOKEN_ADDRESS,
  TOKEN_FAUCET_ADDRESS,
  TOKEN_FAUCET_ABI,
} from "./contracts";
import { Contract } from "ethers";



async function connectWalletEval() {
  if (!window.ethereum) throw new Error("MetaMask not found");
  const provider = getBrowserProvider();
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return await signer.getAddress(); // string
}

async function requestTokensEval() {
  const faucet = await getFaucetWithSigner();
  const tx = await faucet.requestTokens();
  const receipt = await tx.wait();
  return receipt.hash; // string
}

async function getBalanceEval(address) {
  if (!address) throw new Error("address is required");
  const bal = await getTokenBalance(address);
  return bal.toString();
}

async function canClaimEval(address) {
  if (!address) throw new Error("address is required");
  const provider = getBrowserProvider();
  const faucet = new Contract(TOKEN_FAUCET_ADDRESS, TOKEN_FAUCET_ABI, provider);
  return await faucet.canClaim(address);
}

async function getRemainingAllowanceEval(address) {
  if (!address) throw new Error("address is required");
  const rem = await getRemainingAllowance(address);
  return rem.toString();
}

async function getContractAddressesEval() {
  return {
    token: FAUCET_TOKEN_ADDRESS,
    faucet: TOKEN_FAUCET_ADDRESS,
  };
}

window.__EVAL__ = {
  connectWallet: connectWalletEval,
  requestTokens: requestTokensEval,
  getBalance: getBalanceEval,
  canClaim: canClaimEval,
  getRemainingAllowance: getRemainingAllowanceEval,
  getContractAddresses: getContractAddressesEval,
};
