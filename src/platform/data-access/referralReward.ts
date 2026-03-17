import mongoose from "mongoose";
import userDatas from "../../user/data-access";

interface CreateParam {
  user: string
  amount: number
}

const makeReferralRewardDB = (referRewardModel: mongoose.Model<any>) => {
  return {
    create: async ({ user, amount }: CreateParam) => {
      try {
        const isExists = await referRewardModel.findOne({
          user, status: 'pending'
        })

        if (!!isExists) {
          throw new Error("You already request claim");
        }

        const userInfo = await userDatas.UserDB.findOne({
          filter: { address: user }
        })

        if (userInfo.amount === 0) {
          throw new Error("no claimable amount");
        }

        const tempData = {
          user: user,
          amount: amount,
          action: "claimReferralReward",
          status: "pending",
          tx: "",
          log: ""
        }

        const newData = new referRewardModel(tempData);
        const saveData = await newData.save();

        if (!saveData) {
          throw new Error("UserDB Database Error");
        }

        await userDatas.UserDB.update({
          filter: { address: user },
          update: { referralReward: 0 }
        })

        return { status: 200, message: "Claim request successed" }
      } catch (err) {
        return { status: 500, message: err.message }
      }
    },

    findOne: async ({ filter }: DataAccessParam) => {
      return referRewardModel.findOne(filter);
    },

    find: async ({ filter }: DataAccessParam) => {
      return referRewardModel.find(filter);
    },

    update: async ({ filter, update }: DataAccessParam) => {
      return referRewardModel.findOneAndUpdate(
        filter,
        update
      );
    },

    remove: async ({ filter }: DataAccessParam) => {
      const res: any = await referRewardModel.deleteOne(filter);
      return {
        found: res.n,
        deleted: res.deletedCount
      };
    }
  }
}

export { makeReferralRewardDB };