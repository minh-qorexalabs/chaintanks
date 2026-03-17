import { ethers } from "ethers";

import { fromBigNum } from "../../utils";
import { setlog } from "../../utils/setlog";
import { provider } from "../contracts/providers";
import { EnergyPool, NFTTANK } from "../contracts";
import { handleEvent } from "../../utils/blockHandler";

import blockchainDatas from "../data-access";
import userDatas from "../../user/data-access";
import platformDatas from "../../platform/data-access";
import platfromService from "../../platform/services";

interface TxDataObject {
  to: string
  from: string
  tokenId: number
  isTempType?: any
}

export const blockchainHandler = () => {
  const transferHandler = async (tx: any, id: string) => {
    try {
      let txData: TxDataObject = {
        to: tx.args.to,
        from: tx.args.from,
        tokenId: fromBigNum(tx.args.tokenId, 0)
      }

      if (txData.from === ethers.constants.AddressZero) {
        let tankInfo: any;

        //temp
        if (txData.isTempType != undefined) {
          tankInfo = { class: txData.isTempType };
        } else {
          tankInfo = await NFTTANK.tanks(txData.tokenId);
        }

        //mint 
        const tankType = await platformDatas.ClassesDB.findOne({
          filter: { id: Number(tankInfo.class) }
        })

        if (!tankType) {
          throw new Error("blockchainHandler/transferHandler :invalid type ");
        }

        await platformDatas.NftTankDB.create({
          id: String(txData.tokenId),
          owner: String(txData.to).toUpperCase(),
          classType: tankType.id,

          name: "tank" + txData.tokenId,
          image: tankType.image,
          description: tankType.description,
          health: tankType.health,
          fireRate: tankType.fireRate,
          firePower: tankType.firePower,
          speed: tankType.speed,
          borrower: String(txData.to).toUpperCase()
        })
      } else {
        //transfer
        await platformDatas.NftTankDB.update({
          filter: { id: txData.tokenId },
          update: {
            owner: String(txData.to).toUpperCase(),
            borrower: String(txData.to).toUpperCase()
          }
        })
      }
    } catch (err) {
      setlog('transferHandler :: ', err.message)
    }
  }

  const mintHandler = async (tx: any, id: string) => {
    try {
      let txData = {
        id: tx.args.id,
        user: tx.args.user,
        refCode: tx.args.refCode,
        price: fromBigNum(tx.args.price)
      }

      if (txData.user != ethers.constants.AddressZero) {
        const userData = await userDatas.UserDB.findOne({
          filter: { address: txData.user }
        })

        let referrerData: any;
        if (userData?.referrer) {
          referrerData = await userDatas.UserDB.findOne({
            filter: { address: userData?.referrer }
          })
        } else {
          referrerData = await userDatas.UserDB.findOne({
            filter: { referralCode: txData.refCode }
          })
        }


        if (userData && referrerData) {
          if (!userData?.referrer && userData.referralCode === txData.refCode) {
            return
          }

          const refReward = txData.price * 0.2
          const referralReward = Number(referrerData.referralReward) + refReward
          const referrallers = [...new Set([...referrerData.referrallers, txData.user])]

          await userDatas.UserDB.update({
            filter: { address: txData.user },
            update: { referrer: referrerData.address }
          })

          await userDatas.UserDB.update({
            filter: { address: referrerData.address },
            update: { referrallers: referrallers, referralReward: referralReward }
          })

          await platformDatas.NotifiDB.create({
            user: referrerData.address,
            title: `Get Referrer reward ${refReward}`,
            description: `${userData.address} buy a tank ${txData.id}`,
            status: "pending",
            created: +new Date()
          })
        }
      }
    } catch (err) {
      setlog('mintHandler :: ', err.message)
    }
  }

  const upgradeHandler = async (tx: any, id: string) => {
    try {
      let txData = {
        newLevel: Number(tx.args.level),
        tokenId: fromBigNum(tx.args.tokenId, 0),
      }

      console.log("upgradeHandler", txData);
      await platformDatas.NftTankDB.update({
        filter: { id: String(txData.tokenId) },
        update: {
          level: txData.newLevel,
          maxEnergyPool: txData.newLevel * 300
        }
      })
    } catch (err) {
      setlog('upgradeHandler :: ', err.message)
    }
  }

  const stakeHandler = async (tx: any, id: string) => {
    try {
      let txData = {
        from: tx.args.from,
        to: tx.args.to,
        tokenId: fromBigNum(tx.args.id, 0),
        amount: fromBigNum(tx.args.value, 18)
      }

      const tankID: string = String(txData.tokenId)
      const totalStake = await EnergyPool.supplies(tx.args.id);

      await platfromService.updateTankEnergy(tankID)
      await platformDatas.NftTankDB.update({
        filter: { id: tankID },
        update: {
          energyPool: Number(fromBigNum(totalStake, 18)),
          maxEnergy: Number(fromBigNum(totalStake, 18)) * 1 + 1000,
        }
      })

      await platfromService.updateTankEnergy(tankID)
    } catch (err) {
      setlog('stakeHandler :: ', err.message)
    }
  }


  const handleStart = () => {
    const BlockNumDB = blockchainDatas.BlockNumDB

    handleEvent({
      id: "Transfer",
      provider: provider,
      contract: NFTTANK,
      event: "Transfer",
      times: 15,
      handler: transferHandler,
      BlockNumController: BlockNumDB,
    })

    handleEvent({
      id: "Mint",
      provider: provider,
      contract: NFTTANK,
      event: "Mint",
      times: 15,
      handler: mintHandler,
      BlockNumController: BlockNumDB,
    })

    handleEvent({
      id: "LevelUpgrade",
      provider: provider,
      contract: NFTTANK,
      event: "LevelUpgrade",
      times: 15,
      handler: upgradeHandler,
      BlockNumController: BlockNumDB,
    })

    handleEvent({
      id: "TransferSingle",
      provider: provider,
      contract: EnergyPool,
      event: "TransferSingle",
      times: 15,
      handler: stakeHandler,
      BlockNumController: BlockNumDB,
    });
  }

  handleStart()
}