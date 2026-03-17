import jwt from "jsonwebtoken";
import { ethers } from "ethers";
import { config } from "../../config";

interface CreateTokenParams {
  name: string
  email: string
  address: string
}

const AuthServices = {
  createReferralCode: (length: number = 32) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';

    let str = ""
    for (var i = 0; i < length - 1; i++) {
      str += characters.charAt(Math.floor(Math.random() * length))
    }

    return ethers.utils.formatBytes32String(str);
  },

  createToken: (data: CreateTokenParams): string => {
    try {
      const token = jwt.sign(data, config.JWT_SECRET, {
        expiresIn: "144h",
      })

      return token
    } catch (err) {
      throw new Error(err.message);
    }
  },

  verifyToken: async (token: string): Promise<UserAuthObject> => {
    try {
      return jwt.verify(token, config.JWT_SECRET) as UserAuthObject
    } catch (err) {
      throw new Error(`Could not verify token: ${err.message}`);
    }
  }
}

export default AuthServices