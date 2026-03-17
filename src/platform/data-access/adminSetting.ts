import mongoose from "mongoose";

const makeAdminSetDB = (adminSetModel: mongoose.Model<any>) => {
  return {
    create: async (data: AdminSettingObject) => {
      const newData = new adminSetModel(data);
      const saveData = await newData.save();
      if (!saveData) {
        throw new Error("UserDB Database Error");
      }
      return saveData;
    },

    findOne: async ({ filter }: DataAccessParam) => {
      return adminSetModel.findOne(filter);
    },

    find: async ({ filter }: DataAccessParam) => {
      return adminSetModel.find(filter);
    },

    update: async ({ filter, update }: DataAccessParam) => {
      return adminSetModel.findOneAndUpdate(
        filter,
        update
      );
    },

    remove: async ({ filter }: DataAccessParam) => {
      const res: any = await adminSetModel.deleteOne(filter);
      return {
        found: res.n,
        deleted: res.deletedCount
      };
    }
  }
}

export { makeAdminSetDB };