import mongoose from "mongoose";
import { getUTCTime } from "../../utils";

const makeUserDB = (UserModel: mongoose.Model<any>) => {
  return {
    create: async (data: UserDataObject) => {
      const newData = new UserModel(data);
      const saveData = await newData.save();
      if (!saveData) {
        throw new Error("UserDB Database Error");
      }
      return saveData;
    },

    findOne: async ({ filter }: DataAccessParam) => {
      return UserModel.findOne(filter);
    },

    find: async ({ filter }: DataAccessParam) => {
      return UserModel.find(filter);
    },

    findRank: async ({ filter }: DataAccessParam) => {
      try {
        let tempRank = -1
        let user = await UserModel.findOne(filter);

        if (user) {
          tempRank = await UserModel.count({
            "merit": { "$gt": user.merit }
          })
        }

        return tempRank
      } catch (err) {
        return -1
      }
    },

    findWinners: async ({ filter }: DataAccessParam) => {
      return await UserModel.find(filter).sort({ merit: -1 }).limit(5)
    },

    update: async ({ filter, update }: DataAccessParam) => {
      return UserModel.findOneAndUpdate(
        filter,
        update
      );
    },

    remove: async ({ filter }: DataAccessParam) => {
      const res: any = await UserModel.deleteOne(filter);
      return {
        found: res.n,
        deleted: res.deletedCount
      };
    },
  }
}

export { makeUserDB };