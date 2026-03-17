import mongoose from "mongoose";
import platfromService from "../services";

const makeNftTankDB = (nftTankModel: mongoose.Model<any>) => {
  return {
    create: async (data: NftTankObject) => {
      const newData = new nftTankModel(data);
      const saveData = await newData.save();
      if (!saveData) {
        throw new Error("UserDB Database Error");
      }
      return saveData;
    },

    findOne: async ({ filter }: DataAccessParam) => {
      return nftTankModel.findOne(filter);
    },

    find: async ({ filter }: DataAccessParam) => {
      return nftTankModel.find(filter);
    },

    getUpgradeSign: async ({ filter }: DataAccessParam) => {
      const tank = await nftTankModel.findOne(filter);
      const availableLevel = Math.floor(tank.tankLevel);

      const signature = await platfromService.getUpdateSignature(
        tank.id,
        availableLevel
      )

      return { availableLevel, signature };
    },

    update: async ({ filter, update }: DataAccessParam) => {
      return nftTankModel.findOneAndUpdate(
        filter,
        update
      );
    },

    remove: async ({ filter }: DataAccessParam) => {
      const res: any = await nftTankModel.deleteOne(filter);
      return {
        found: res.n,
        deleted: res.deletedCount
      };
    },
  }
}

export { makeNftTankDB };