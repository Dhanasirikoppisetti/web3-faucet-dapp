import { useEffect, useState } from "react";
import {
  getBrowserProvider,
  getFaucetWithSigner,
  getTokenBalance,
  getRemainingAllowance,
  getCooldownStatus,
} from "./utils/contracts";

function formatSeconds(sec) {
  if (sec <= 0) return "Ready to claim";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function App() {
  const [account, setAccount] = useState(null);
  const [status, setStatus] = useState("");
  const [balance, setBalance] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [cooldown, setCooldown] = useState({ ready: true, secondsLeft: 0 });
  const [loading, setLoading] = useState(false);
  const [networkName, setNetworkName] = useState("");
  const [wrongNetwork, setWrongNetwork] = useState(false);

  async function loadAccountData(addr) {
    try {
      const [bal, rem, cd] = await Promise.all([
        getTokenBalance(addr),
        getRemainingAllowance(addr),
        getCooldownStatus(addr),
      ]);
      setBalance(bal);
      setRemaining(rem);
      setCooldown(cd);
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Failed to load account data");
    }
  }

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setStatus("MetaMask not found");
        return;
      }

      const provider = getBrowserProvider();
      await provider.send("eth_requestAccounts", []);

      // Detect actual network
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      let netName = "Unknown";
      if (chainId === 11155111) netName = "Sepolia";
      else if (chainId === 1) netName = "Mainnet";
      else if (chainId === 31337) netName = "Localhost";
      else netName = `Chain ${chainId}`;

      setNetworkName(netName);

      // Check if wrong network
      if (chainId !== 11155111) {
        setWrongNetwork(true);
        setStatus("⚠️ Wrong network! Please switch MetaMask to Sepolia");
        return;
      }

      setWrongNetwork(false);

      const signer = await provider.getSigner();
      const addr = await signer.getAddress();

      setAccount(addr);
      setStatus(`Wallet connected (${netName})`);
      await loadAccountData(addr);
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Failed to connect wallet");
    }
  }

  async function handleClaim() {
    try {
      if (!window.ethereum) {
        setStatus("MetaMask not found");
        return;
      }
      if (!account) {
        setStatus("Connect wallet first");
        return;
      }

      if (wrongNetwork) {
        setStatus("Switch to Sepolia network first");
        return;
      }

      if (!cooldown.ready) {
        setStatus("Cooldown not elapsed yet");
        return;
      }

      setLoading(true);
      setStatus("Sending transaction...");

      const faucet = await getFaucetWithSigner();
      const tx = await faucet.requestTokens();
      await tx.wait();

      setStatus("Tokens claimed successfully!");
      await loadAccountData(account);
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  }

  // Update cooldown every 30s
  useEffect(() => {
    if (!account || wrongNetwork) return;
    const id = setInterval(async () => {
      try {
        const cd = await getCooldownStatus(account);
        setCooldown(cd);
      } catch {
        // ignore
      }
    }, 30000);
    return () => clearInterval(id);
  }, [account, wrongNetwork]);

  // React to MetaMask account/network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setBalance(null);
        setRemaining(null);
        setCooldown({ ready: true, secondsLeft: 0 });
        setStatus("Wallet disconnected");
      } else {
        connectWallet(); // re-check network
      }
    };

    const handleChainChanged = () => {
      window.location.reload(); // reload on network change
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const claimDisabled = !account || loading || !cooldown.ready || wrongNetwork;

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Web3 Faucet DApp</h1>
      <p>Network: {networkName || "Not connected"} (via MetaMask)</p>

      <button onClick={connectWallet}>
        {account ? `Connected: ${account.slice(0, 6)}...` : "Connect Wallet"}
      </button>

      {wrongNetwork && (
        <p style={{ color: "red", marginTop: "1rem" }}>
          ⚠️ Please switch MetaMask to Sepolia network
        </p>
      )}

      {account && !wrongNetwork && (
        <>
          <p style={{ marginTop: "1rem" }}>Address: {account}</p>
          <p>Token balance (wei): {balance ?? "-"}</p>
          <p>Remaining allowance (wei): {remaining ?? "-"}</p>
          <p>
            Cooldown:{" "}
            {cooldown.ready
              ? "Ready to claim"
              : `Wait ${formatSeconds(cooldown.secondsLeft)}`}
          </p>
        </>
      )}

      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleClaim} disabled={claimDisabled}>
          {loading ? "Claiming..." : "Claim 100 FTK"}
        </button>
      </div>

      <p style={{ marginTop: "1rem" }}>{status}</p>
    </div>
  );
}

export default App;
