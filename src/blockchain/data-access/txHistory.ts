import mongoose from "mongoose";

const makeTxHistoryDB = (txHistoryModel: mongoose.Model<any>) => {
  return {
    create: async (data: TxHistoryObject) => {
      const newData = new txHistoryModel(data);
      const saveData = await newData.save();
      if (!saveData) {
        throw new Error("UserDB Database Error");
      }
      return saveData;
    },

    findOne: async ({ filter }: DataAccessParam) => {
      return txHistoryModel.findOne(filter);
    },

    find: async ({ filter }: DataAccessParam) => {
      return txHistoryModel.find(filter);
    },

    update: async ({ filter, update }: DataAccessParam) => {
      return txHistoryModel.findOneAndUpdate(
        filter,
        update
      );
    },

    remove: async ({ filter }: DataAccessParam) => {
      const res: any = await txHistoryModel.deleteOne(filter);
      return {
        found: res.n,
        deleted: res.deletedCount
      };
    }
  }
}

export { makeTxHistoryDB };