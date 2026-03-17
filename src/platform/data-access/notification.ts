import mongoose from "mongoose";

const makeNotifiDB = (notifiModel: mongoose.Model<any>) => {
  return {
    create: async (data: NotificationObject) => {
      const newData = new notifiModel(data);
      const saveData = await newData.save();
      if (!saveData) {
        throw new Error("UserDB Database Error");
      }
      return saveData;
    },

    findOne: async ({ filter }: DataAccessParam) => {
      return notifiModel.findOne(filter);
    },

    find: async ({ filter }: DataAccessParam) => {
      return notifiModel.find(filter);
    },

    update: async ({ filter, update }: DataAccessParam) => {
      return notifiModel.findOneAndUpdate(
        filter,
        update
      );
    },

    remove: async ({ filter }: DataAccessParam) => {
      const res: any = await notifiModel.deleteOne(filter);
      return {
        found: res.n,
        deleted: res.deletedCount
      };
    }
  }
}

export { makeNotifiDB };