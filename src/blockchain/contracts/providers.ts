import { ethers } from "ethers";
import { config } from "../../config";

const supportChainId = config.CHAINID;

const RPCS = {
  250: "https://rpc.ftm.tools/",
  4002: "https://rpc.testnet.fantom.network",
  9000: "https://eth.bd.evmos.dev:8545",
  9001: "https://eth.bd.evmos.org:8545",
  421613: "https://sepolia.infura.io/v3/",
  42161: "https://arb1.arbitrum.io/rpc",
  5: "https://goerli.blockpi.network/v1/rpc/public",
};

const providers = {
  250: new ethers.providers.JsonRpcProvider(RPCS[250]),
  4002: new ethers.providers.JsonRpcProvider(RPCS[4002]),
  9000: new ethers.providers.JsonRpcProvider(RPCS[9000]),
  9001: new ethers.providers.JsonRpcProvider(RPCS[9001]),
  42161: new ethers.providers.JsonRpcProvider(RPCS[42161]),
  421613: new ethers.providers.JsonRpcProvider(RPCS[421613]),
  5: new ethers.providers.JsonRpcProvider(RPCS[5]),
};

const provider = providers[supportChainId];

export { provider, supportChainId }