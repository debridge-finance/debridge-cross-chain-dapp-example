import "@debridge-finance/hardhat-debridge";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import 'dotenv/config';
import { HardhatUserConfig } from "hardhat/config";

import "./src/tasks/deployment";

const accounts = process.env.DEPLOYER
  ? [`${process.env.DEPLOYER}`]
  : []

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.7",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    polygon: {
      chainId: 137,
      url: process.env.RPC_POLYGON || "https://polygon-rpc.com/",
      accounts,
      // gasPrice: 50e9,
    },
    bnb: {
      chainId: 56,
      url: process.env.RPC_BNB ||"https://bsc-dataseed.binance.org",
      accounts,
    },
  },
  etherscan: {
    apiKey: {
      polygon: `${process.env.ETHERSCAN_POLYGON_API_KEY}`,
      arbitrumOne: `${process.env.ETHERSCAN_ARBITRUMONE_API_KEY}`,
      bsc: `${process.env.ETHERSCAN_BSC_API_KEY}`,
    }
  }
};

export default config;
