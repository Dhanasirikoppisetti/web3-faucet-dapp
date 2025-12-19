const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: process.env.SEPOLIA_KEY ? [process.env.SEPOLIA_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY, // single key for v2
  },
};
