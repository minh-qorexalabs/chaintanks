import mongoose from "mongoose";

const makeBlockNumDB = (blockNumModel: mongoose.Model<any>) => {
  return {
    create: async (data: BlockNumObject) => {
      const newData = new blockNumModel(data);
      const saveData = await newData.save();
      if (!saveData) {
        throw new Error("UserDB Database Error");
      }
      return saveData;
    },

    findOne: async ({ filter }: DataAccessParam) => {
      return blockNumModel.findOne(filter);
    },

    find: async ({ filter }: DataAccessParam) => {
      return blockNumModel.find(filter);
    },

    update: async ({ filter, update }: DataAccessParam) => {
      return blockNumModel.findOneAndUpdate(
        filter,
        update
      );
    },

    remove: async ({ filter }: DataAccessParam) => {
      const res: any = await blockNumModel.deleteOne(filter);
      return {
        found: res.n,
        deleted: res.deletedCount
      };
    }
  }
}

export { makeBlockNumDB };