import { ethers } from "ethers";
import { AdminWallet } from "../contracts";

const blockchainService = {
  getAdminSignature: async (messageHash: any) => {
    let signature = await AdminWallet.signMessage(
      ethers.utils.arrayify(messageHash)
    );

    return signature
  },

  getAddrFromSig: async (message: any, signature: any) => {
    const address = await ethers.utils.verifyMessage(message, signature);

    return address.toUpperCase()
  },
}

export default blockchainService