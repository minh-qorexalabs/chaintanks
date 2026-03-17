import { ethers } from "ethers";
import blockchainService from "../../blockchain/services";
import platformDatas from "../data-access";

const platfromService = {
  getUpdateSignature: async (id: string, level: number) => {
    const messageHash = ethers.utils.solidityKeccak256(
      ["uint", "uint"],
      [id, level]
    )

    const signature = await blockchainService.getAdminSignature(
      messageHash
    )

    return signature
  },

  updateTankLevel: async (tankID: string) => {
    const tank = await platformDatas.NftTankDB.findOne({
      filter: { id: tankID }
    })

    if (!tank) {
      throw new Error("tank id invalid");
    }

    const tankClassType = await platformDatas.ClassesDB.findOne({
      filter: { id: tank.classType }
    })

    //update level
    const newLevel = Math.floor(Math.sqrt((tank.experience) / 1000));
    if (newLevel <= tank.tankLevel) {
      return tank.tankLevel
    }

    let speedAdd = tankClassType.speedAdd
    let healthAdd = tankClassType.healthAdd
    let fireRateAdd = tankClassType.fireRateAdd
    let firePowerAdd = tankClassType.firePowerAdd

    let updateLevel = (newLevel - tank.tankLevel)
    let tempHealth = Number(tank.health) + Number(healthAdd * updateLevel)
    let tempFireRate = Number(tank.fireRate) + Number(fireRateAdd * updateLevel)
    let tempFirePower = Number(tank.firePower) + Number(firePowerAdd * updateLevel)
    let tempSpeed = Number(tank.speed) + Number(speedAdd * updateLevel)

    if (tempFireRate <= 40) {
      tempFireRate = 40
    }

    await platformDatas.NftTankDB.update({
      filter: { id: tankID },
      update: {
        health: tempHealth,
        fireRate: tempFireRate,
        firePower: tempFirePower,
        speed: tempSpeed,
        tankLevel: newLevel,
      }
    })

    return newLevel
  },

  updateTankEnergy: async (tankID: string) => {
    const tank = await platformDatas.NftTankDB.findOne({
      filter: { id: tankID }
    })

    const now = Date.now();
    const from = + new Date(tank.updatedAt);
    const duration = (now - from) / 1000;
    const chargedEnergy = duration * (tank.maxEnergy) / 24 / 3600; // duration * (energyPool + init recover power)*changeRate

    let newEnergy = tank.energy + chargedEnergy;

    if (newEnergy > tank.maxEnergy) {
      newEnergy = tank.maxEnergy
    }

    await platformDatas.NftTankDB.update({
      filter: { id: tank.id },
      update: { energy: Math.round(newEnergy) }
    })

    return
  },

  addUserXp: () => {

  },

  addTankXp: () => {

  },

  addGuildXp: () => {

  },

  addItemXp: () => {

  },
}

export default platfromService