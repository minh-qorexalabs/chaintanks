import { ethers } from "ethers";
import { Provider, setMulticallAddress } from "ethers-multicall";

import { config } from "../../config";
import Abis from "./contracts/abis.json";
import Addresses from "./contracts/addresses.json";
import { provider, supportChainId } from "./providers";

setMulticallAddress(250, "0x95060284EB5D2C335D2B9BF173e35aAB99719dAa");
setMulticallAddress(421613, "0x6B3a27944A73cB7a8a12aA6C45d196732e1E3543");

const multicallProvider = new Provider(provider, supportChainId);
const AdminWallet = new ethers.Wallet(config.ADMINWALLET, provider);

// make contract objects
const NFTTANK = new ethers.Contract(Addresses.NFTTank, Abis.NFTTank, provider);
const EnergyPool = new ethers.Contract(Addresses.EnergyPool, Abis.EnergyPool, provider);
const TANKTOKEN = new ethers.Contract(Addresses.TankToken, Abis.TankToken, provider);
const RewardPool = new ethers.Contract(Addresses.RewardPool, Abis.RewardPool, AdminWallet);

export {
  AdminWallet,
  multicallProvider,

  NFTTANK,
  EnergyPool,
  TANKTOKEN,
  RewardPool,
}
