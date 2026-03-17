import { Response, Request, NextFunction } from "express";

import userService from '../services';
import userDatas from '../data-access';
import { Now, getHash } from '../../utils';
import { setlog } from '../../utils/setlog';
import { toChecksumAddress } from '../../utils/blockchain';
import blockchainService from '../../blockchain/services';

const AuthController = {

  
  signup: async (req: Request, res: Response) => {
    try {
      const { name, email, password, sign, referralUser } = req.body;
      const referralCode = userService.createReferralCode()

      const message = "welcome " + name
      const address = await blockchainService.getAddrFromSig(message, sign)

      // service
      const existsMail = await userService.checkExistOfAccount({
        name, email, address
      })

      if (existsMail.res === true) {
        throw new Error(`${existsMail.param} is already exist!`);
      };


      const hashedPassword = getHash(name, password)
      const tempAddress = toChecksumAddress(address)

      // data access
      await userDatas.UserDB.create({
        name: name,
        email: email,
        address: tempAddress,
        referralCode: referralCode,
        password: hashedPassword,

        created: Now(),
        lasttime: Now(),
      })

      const token = userService.createToken({
        name: name,
        email: email,
        address: tempAddress,
      })

      return res.status(200).json({
        status: true, token: token
      })
    } catch (err) {
      setlog("request", err.message)
      const msg = err.message || "internal error"

      return res.status(200).send({
        status: false, message: msg,
      })
    }
  },

  login: async (req: Request, res: Response) => {
    console.log("name:", req.body.name);
    try {
      const { name, password } = req.body;
      const hashedPassword = getHash(name, password)

      const userData = await userDatas.UserDB.findOne({
        filter: {
          $and: [
            { name: name },
            { role: { $ne: 'ban' } },
          ]
        }
      })

      if (!userData) {
        throw new Error("Invalid username")
      }

      if (userData.password != hashedPassword) {
        throw new Error("Invalid password")
      }

      const token = userService.createToken({
        name: name,
        email: userData.email,
        address: userData.address,
      })

      return res.status(200).json({
        status: true, token: token
      })
    } catch (err) {
      setlog("request", err.message)
      const msg = err.message || "internal error"

      return res.status(200).send({
        status: false, message: msg,
      })
    }
  },

  middleware: async (req: any, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization || "";

      if (!token || typeof token !== 'string') {
        throw new Error("Auth token invalid");
      }

      const user = await userService.verifyToken(token)

      const userData = await userDatas.UserDB.findOne({
        filter: {
          $and: [
            { name: user.name },
            { role: { $ne: 'ban' } },
          ]
        }
      })

      if (!userData) {
        throw new Error("user not exists");
      }

      req.user = userData
      next()
    } catch (err) {
      setlog("Authcheck", err.message)
      return res.sendStatus(403)
    }
  },
  getPassword: async (req: Request, res: Response) => {
    const { name, password } = req.body;
    const hashedPassword = getHash(name, password);
    res.json({password: hashedPassword});
  }
}

export default AuthController