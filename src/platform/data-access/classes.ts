import mongoose from "mongoose";

const makeClassesDB = (classesModel: mongoose.Model<any>) => {
  return {
    create: async (data: ClassesObject) => {
      const newData = new classesModel(data);
      const saveData = await newData.save();
      if (!saveData) {
        throw new Error("UserDB Database Error");
      }
      return saveData;
    },

    findOne: async ({ filter }: DataAccessParam) => {
      return classesModel.findOne(filter);
    },

    find: async ({ filter }: DataAccessParam) => {
      return classesModel.find(filter);
    },

    update: async ({ filter, update }: DataAccessParam) => {
      return classesModel.findOneAndUpdate(
        filter,
        update
      );
    },

    remove: async ({ filter }: DataAccessParam) => {
      const res: any = await classesModel.deleteOne(filter);
      return {
        found: res.n,
        deleted: res.deletedCount
      };
    },

    dropDB: async () => {
      return await classesModel.deleteMany({});
    }
  }
}

export { makeClassesDB };