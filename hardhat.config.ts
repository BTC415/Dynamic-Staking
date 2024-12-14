import { HardhatUserConfig } from "hardhat/config";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-toolbox";

const infuraKey: string = process.env.INFURA_API_KEY as string;
const admin1: string = process.env.ADMIN1 ? process.env.ADMIN1 as string: "";
const admin2: string = process.env.ADMIN2 ? process.env.ADMIN2 as string: "";
const etherscanKey: string = process.env.ETHERSCAN_KEY ? process.env.ETHERSCAN_KEY as string: "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100,
      },
      // viaIR: true,
    },
  },
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${infuraKey}`,
      accounts: [`0x${admin1}`, `0x${admin2}`],
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${infuraKey}`,
      accounts: [`0x${admin1}`, `0x${admin2}`],
    },
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: etherscanKey,
      sepolia: etherscanKey
    },
  },
  gasReporter: {
    enabled: true,
  },
  sourcify: {
    enabled: true,
  },
};

export default config;
