import baseClasses from "./json/classes.json"

import { dbUpdator } from "./dbUpdator"
import { blockchainHandler } from "./handleEvent"
import platformDatas from "../../platform/data-access"

const initClasses = async () => {
  await platformDatas.ClassesDB.dropDB()

  await Promise.all(
    baseClasses.map(async (newClass: ClassesObject) => {
      await platformDatas.ClassesDB.create({
        id: newClass.id,
        name: newClass.name,
        image: newClass.image,
        description: newClass.description,
        health: newClass.health,
        fireRate: newClass.fireRate,
        firePower: newClass.firePower,
        speed: newClass.speed,
        healthAdd: newClass.healthAdd,
        fireRateAdd: newClass.fireRateAdd,
        firePowerAdd: newClass.firePowerAdd,
        speedAdd: newClass.speedAdd,
        price: newClass.price
      })
    })
  )
}

export const initHandler = async () => {
  // class init
  await initClasses();

  blockchainHandler();
  dbUpdator();
}