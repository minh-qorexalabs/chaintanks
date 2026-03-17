import cron from "node-cron"

import { setlog } from "../../utils/setlog";
import { fromBigNum, toBigNum } from "../../utils";
import { RewardPool, TANKTOKEN } from "../contracts";

import userDatas from "../../user/data-access";
import platformDatas from "../../platform/data-access";
import platfromService from "../../platform/services";

const maxReward = 1500;
const rewardRate = [5, 4, 3, 2, 1];

const rewardHandler = async () => {
  const lastReward = await platformDatas.AdminSetDB.findOne({
    filter: { type: "lastReward" }
  })

  if (!lastReward) {
    await platformDatas.AdminSetDB.create({
      type: "lastReward",
      value: new Date().toString()
    })
  }

  const rewardHandle = async () => {
    try {
      console.log(`running a reward every day`);
      let poolAmount = await RewardPool.rewardPoolAmount()
      let totalRewardAmount = fromBigNum(poolAmount) / 30;

      if (totalRewardAmount > maxReward) {
        totalRewardAmount = maxReward;
      }

      let rewardUsers = await userDatas.UserDB.findWinners({
        filter: { merit: { $gt: 0 } },
      })

      // proceed reward
      const rewardUserAmounts = [];
      const rewardUserAddresses = [];

      rewardUsers.map((rewardUser, index) => {
        if (index < 5) {
          const userAddr = rewardUser.address
          const userAmount = toBigNum(totalRewardAmount * rewardRate[index] / 15)

          rewardUserAddresses.push(userAddr)
          rewardUserAmounts.push(userAmount)
        }
      })


      // remove merit for rewarded users
      if (rewardUsers.length == 0) {
        return;
      }

      console.log(rewardUserAddresses, rewardUserAmounts);
      let tx = await RewardPool.award(rewardUserAddresses, rewardUserAmounts);
      await tx.wait();

      console.log("reward tx", tx.hash);

      rewardUsers.map((rewardUser, index) => {
        const rewardAmount = fromBigNum(rewardUserAmounts[index])

        userDatas.UserDB.update({
          filter: { address: rewardUser.address },
          update: { merit: 0 },
        })


        platformDatas.NotifiDB.create({
          user: rewardUser.address,
          title: `Daily Reward!`,
          description: `You got ${rewardAmount}DFTL!`,
          status: "pending",
          created: + new Date()
        })
      });

      await platformDatas.AdminSetDB.update({
        filter: { type: "lastReward" },
        update: { value: new Date().toString() }
      })
    } catch (err) {
      console.error('blockchain/api/rewardHandler', err.message);
    }
  }

  cron.schedule(`0 0 0 * * *`, rewardHandle, { timezone: "Etc/GMT+0" });
}

const energyUpdateHandler = () => {
  cron.schedule(`*/30 * * * * *`, async () => {
    //console.log(`running a dbUpdator  every 30 second`);
    const tanks = await platformDatas.NftTankDB.find({
      filter: {}
    })

    //update energy
    tanks.map((tank: NftTankObject) => {
      platfromService.updateTankEnergy(tank.id)
    })
  })
}

const referralRewardHandler = async () => {
  const lastReward = await platformDatas.AdminSetDB.findOne({
    filter: { type: "last Claim Reward" }
  })

  if (!lastReward) {
    await platformDatas.AdminSetDB.create({
      type: "last Claim Reward",
      value: new Date().toString()
    })
  }

  const referRewardHandle = async () => {
    try {
      // console.log(`running a referralReward handler  every 30 second`);
      const rewardUsers = await platformDatas.ReferRewardDB.find({
        filter: { status: "pending", tx: "" }
      })

      const rewardUserAmounts = [];
      const rewardUserAddresses = [];

      rewardUsers.map((refer: ReferralRewardObject) => {
        rewardUserAddresses.push(refer.user);
        rewardUserAmounts.push(toBigNum(refer.amount));
      })

      // remove merit for rewarded users
      if (rewardUsers.length == 0) {
        return;
      }

      await platformDatas.ReferRewardDB.update({
        filter: {
          $and: [
            { status: "pending" },
            { address: { $in: rewardUserAddresses } },
          ]
        },
        update: { status: "onprocessing" }
      })

      console.log("rewardUserAddresses", rewardUserAddresses, rewardUserAmounts);

      try {
        let tx = await RewardPool.multiSendToken(TANKTOKEN.address, rewardUserAddresses, rewardUserAmounts);
        await tx.wait();

        if (tx.type === 2) {
          rewardUsers.map((rewardUser) => {
            platformDatas.ReferRewardDB.update({
              filter: { address: rewardUser.user, status: "onprocessing" },
              update: { tx: tx.hash, status: "success" },
            })

            platformDatas.NotifiDB.create({
              user: rewardUser.user,
              title: `Claim Reward Success`,
              description: `You got ${rewardUser.amount}DFTL!`,
              status: "pending",
              created: + new Date()
            })
          })
        } else {
          await platformDatas.ReferRewardDB.update({
            filter: {
              $and: [
                { status: "onprocessing" },
                { address: { $in: rewardUserAddresses } },
              ]
            },
            update: {
              tx: tx.hash,
              status: "failed",
              log: "denied due to error"
            }
          })
        }
      } catch (err) {
        setlog("rewardHandler", err.message);
        await platformDatas.ReferRewardDB.update({
          filter: {
            $and: [
              { status: "onprocessing" },
              { address: { $in: rewardUserAddresses } },
            ]
          },
          update: { status: "pending" }
        })
      }

      await platformDatas.AdminSetDB.update({
        filter: { type: "last Claim Reward" },
        update: { value: new Date().toString() },
      })
    } catch (err) {
      setlog('blockchain/api/rewardHandler', err.message);
    }
  }

  cron.schedule(`*/30 * * * * *`, referRewardHandle);
}

export const dbUpdator = () => {
  try {
    energyUpdateHandler();
    rewardHandler();
    referralRewardHandler()
  } catch (err) {
    setlog("blockchain/api/dbupdator", err.message)
  }
}