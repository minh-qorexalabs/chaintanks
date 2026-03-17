import * as socketIO from 'socket.io'

import { setlog } from '../utils/setlog';
import { decryptToJson, encryptFromJson, securityCode } from './utils';

import userService from '../user/services';
import userDatas from '../user/data-access';
import platfromService from '../platform/services';
import platformDatas from '../platform/data-access';

const GameLisnter = (io: any, userMiddleware: any) => {
  io.on("connection", async (socket: socketIO.Socket) => {
    console.log('game socket connected: ', socket.id);
    let limit = 60, timeLimit = 10;
    let requests = [];

    // check bot
    socket.onAny((eventName, ...args) => {
      let now = Date.now()
      let reqData = {
        name: eventName,
        time: now
      }

      requests.push(reqData);

      if (requests.length > limit) {
        if (now - requests[0].time < timeLimit * 1000) {
          console.log("bot attact detect")
          socket.disconnect() // bot attackting
        }

        requests = requests.slice(10)
      }
    })

    // get all tanks 
    socket.on(securityCode['getAlltanks'], async (req) => {
      try {
        const tanks = await platformDatas.NftTankDB.find({
          filter: { $and: [{ role: { $ne: 'ban' } }] }
        })

        socket.emit(securityCode["all-tanks"], { data: encryptFromJson({ tanks: tanks }) });
      } catch (err) {
        console.log("game/api-socket/gameLisnter: ", err.message);
        socket.emit(securityCode["error"], { data: encryptFromJson({ error: err.message }) });
      }
    })

    // get tank energy
    socket.on(securityCode['getEnegy'], async (req) => {
      try {
        const { nft_id } = decryptToJson(req.data)
        const tank = await platformDatas.NftTankDB.findOne({
          filter: { id: nft_id }
        })

        const cryptData = encryptFromJson({ energy: tank.energy })
        socket.emit(securityCode["update-tank-energy"], { data: cryptData })
      } catch (err) {
        console.log("game/api-socket/addExperience: ", err.message);
        socket.emit(securityCode["error"], { data: encryptFromJson({ error: err.message }) });
      }
    })

    // get user tanks
    socket.on(securityCode['getUsertanks'], async (req) => {
      try {
        const { socketId } = decryptToJson(req.data);
        const user = global.users[socketId];
        let sendDataList = [];

        const checkTanks = await platformDatas.NftTankDB.find({
          filter: {
            $and: [
              { role: { $ne: 'ban' } },
              { borrower: user.address }
            ]
          }
        })

        for (const i of checkTanks) {
          await platfromService.updateTankEnergy(i.id)
        }

        const tanks = await platformDatas.NftTankDB.find({
          filter: {
            $and: [
              { role: { $ne: 'ban' } },
              { borrower: user.address }
            ]
          }
        })

        tanks.forEach(i => {
          const tank = {
            ...i._doc,
            ownerNickName: user.name,
            maxEnergy: Math.round(i.maxEnergy),
            energyPool: Math.round(i.energyPool),
            energy: Math.round(i.energy)
          }

          sendDataList.push(tank);
        })

        socket.emit(securityCode["user-tanks"], { data: encryptFromJson({ tanks: sendDataList }) });
      } catch (err) {
        console.log("game/api-socket/gameLisnter: ", err.message);
        socket.emit(securityCode["error"], { data: encryptFromJson({ error: err.message }) });
      }
    })

    // get lendable tanks 
    socket.on(securityCode['getLendingtanks'], async (req) => {
      try {
        const { socketId } = decryptToJson(req.data);
        const user = global.users[socketId];
        let sendDataList = [];

        const checkTanks = await platformDatas.NftTankDB.find({
          filter: {
            $and: [
              { role: { $ne: 'ban' } },
              { borrower: user.address }
            ]
          }
        })

        for (const i of checkTanks) {
          await platfromService.updateTankEnergy(i.id)
        }

        const tanks = await platformDatas.NftTankDB.find({
          filter: {
            $and: [
              { role: { $ne: 'ban' } },
              { borrower: user.address }
            ]
          }
        })

        tanks.forEach(i => {
          const tank = {
            ...i._doc,
            ownerNickName: user.name,
            maxEnergy: Math.round(i.maxEnergy),
            energyPool: Math.round(i.energyPool),
            energy: Math.round(i.energy)
          }

          sendDataList.push(tank);
        })

        socket.emit(securityCode["user-tanks"], { data: encryptFromJson({ tanks: sendDataList }) });
      } catch (err) {
        console.log("game/api-socket/gameLisnter: ", err.message);
        socket.emit(securityCode["error"], { data: encryptFromJson({ error: err.message }) });
      }
    })

    // add experience
    socket.on(securityCode['addExperience'], async (req) => {
      try {
        const { socketID, nft_id, level } = decryptToJson(req.data);
        const user = global.users[socketID];
        const exp = (level + 1) * 100;

        // if (!RoomManager.checkAddExp(socketID, level)) {
        //   socket.emit(securityCode["error"], { data: encryptFromJson({ error: "critical error: detected cheat, your account will be closed." }) });
        //   return
        // }

        userDatas.UserDB.update({
          filter: { address: user.address },
          update: { merit: Number(user.merit) + exp },
        })

        global.users[socketID] = await userDatas.UserDB.findOne({
          filter: { address: user.address }
        })

        await platformDatas.NftTankDB.update({
          filter: { id: nft_id },
          update: { $inc: { experience: exp } }
        })

        const tankLevel = await platfromService.updateTankLevel(nft_id)
        const UpdatedTank = await platformDatas.NftTankDB.findOne({
          filter: { id: nft_id }
        })

        // RoomManager.getRoom(socket.id).room.update
        const resData = {
          ...UpdatedTank._doc,
          ownerNickName: user.name,
          maxEnergy: Math.round(UpdatedTank.maxEnergy),
          energyPool: Math.round(UpdatedTank.energyPool),
          energy: Math.round(UpdatedTank.energy)
        }

        socket.emit(securityCode["update-tank"], { data: encryptFromJson(resData) })
      } catch (err) {
        console.log("game/api-socket/addExperience: ", err.message);
        socket.emit(securityCode["error"], { data: encryptFromJson({ error: err.message }) });
      }
    })

    // spawn tank
    socket.on(securityCode['spawn-tank'], async (req) => {
      try {
        const { photonViewID, nft_id, gameMode } = decryptToJson(req.data);
        const user = global.users[socket.id];

        const tank = await platformDatas.NftTankDB.findOne({
          filter: { id: nft_id, borrower: user.address }
        })

        if (!tank) {
          setlog('spawn-tank', "game/api-socket/spawn-tank: detected cheat([critical]) >>> try game with other tank")

          const message = "critical error: detected cheat, your account will be closed."
          socket.emit(securityCode["error"], { data: encryptFromJson({ error: message }) })
          return
        }

        await platfromService.updateTankEnergy(nft_id)

        if (Number(tank.energy) >= Number(tank.health)) {
          await platformDatas.NftTankDB.update({
            filter: { id: nft_id },
            update: { $inc: { energy: -1 * tank.health } }

          })

          const updatedTank = await platformDatas.NftTankDB.findOne({
            filter: { id: nft_id }
          })

          // if (RoomManager.checkRoomExist(socket.id)) {
          //   const room = RoomManager.getRoom(socket.id);
          //   //room.spawnTank
          // } else {
          //   RoomManager.createRoom(socket, nft_id, socket.id, gameMode, photonViewID);
          // }

          socket.emit(securityCode["spawn-tank"], { data: encryptFromJson(updatedTank) });
        } else {
          // RoomManager.deleteRoom(socket.id);
          socket.emit(securityCode["kicked"], { data: encryptFromJson({ ownerNickName: user.name }) })
        }
      } catch (err) {
        console.log("game/api-socket/spawn-tank: ", err.message);
        socket.emit(securityCode["error"], { data: encryptFromJson({ error: err.message }) });
      }
    })

    // leaderboard
    socket.on(securityCode['getLeaderBoard'], async (req) => {
      try {
        let users = await userDatas.UserDB.find({
          filter: {}
        })

        users = users.sort((a, b) => b.merit - a.merit);
        users = users.map(user => ({
          name: user.name,
          avata_url: user.image,
          merit: user.merit,
          reward: 0
        }))

        console.log("get leaderboard", users);
        socket.emit(securityCode["leaderBoard"], { data: encryptFromJson(users) })
      } catch (err) {
        socket.emit(securityCode["error"], { data: encryptFromJson({ error: err.message }) });
      }
    })

    //rent tank
    socket.on(securityCode['getRentableTanks'], async (req) => {
      try {
        const { str } = decryptToJson(req.data);
        console.log("get RentableTanks", str);

        const sortCB = (a: NftTankObject, b: NftTankObject) => {
          if (str == "level") {
            return b.tankLevel - a.tankLevel
          } else if (str == "pool") {
            return b.energy - a.energy;
          } else return -1;
        }

        let tanks = await platformDatas.NftTankDB.find({
          filter: {
            $and: [
              { borrower: "", },
              { role: { $ne: 'ban' } },
            ]
          }
        })

        tanks = tanks.sort(sortCB);
        tanks = tanks.map((i) => ({
          ...i._doc,
          maxEnergy: Math.round(i.maxEnergy),
          energyPool: Math.round(i.energyPool),
          energy: Math.round(i.energy)
        }))

        socket.emit(securityCode["rentable-tanks"], { data: encryptFromJson({ tanks: tanks }) });
      } catch (err) {
        socket.emit(securityCode["error"], { data: encryptFromJson({ error: err.message }) });
      }
    })

    socket.on(securityCode['rentTank'], async (req) => {
      try {
        const { str } = decryptToJson(req.data);
        const address = global.users[socket.id].address;
        const id = Number(str)

        console.log("get rentTank", str, address);
        const tank = await platformDatas.NftTankDB.findOne({
          filter: { id: id }
        })

        if (address != tank.owner) {
          // user action - return borrowed tanks
          if (!tank || tank.borrower != "") {
            throw new Error("invalid tank id");
          }

          await userService.newBorrow(address)
          let borrowTanks = await platformDatas.NftTankDB.find({
            filter: {
              owner: { $ne: address },
              borrower: address
            }
          })

          borrowTanks.map((tank: NftTankObject) => {
            platformDatas.NftTankDB.update({
              filter: { id: tank.id },
              update: { borrower: "" }
            })
          })
        }

        await platformDatas.NftTankDB.update({
          filter: { id: tank.id },
          update: { borrower: address }
        })

        socket.emit(securityCode["rentTank-result"], { data: encryptFromJson(true) });
      } catch (err) {
        socket.emit(securityCode["error"], { data: encryptFromJson({ error: err.message }) });
      }
    })

    socket.on(securityCode['global-chat'], async (req) => {
      try {
        const { str } = decryptToJson(req.data);
        const name = global.users[socket.id].name;
        const avata_url = global.users[socket.id].image;
        const userAddr = global.users[socket.id].address

        const ranking = await userDatas.UserDB.findRank({
          filter: { address: userAddr }
        })

        const resData = {
          senderName: name,
          avatarUrl: avata_url,
          senderRank: ranking,
          chatText: str
        }

        io.emit(securityCode["global-chat"], { data: encryptFromJson(resData) })
      } catch (err) {
        socket.emit(securityCode["error"], { data: encryptFromJson({ error: err.message }) });
      }
    })

    socket.on(securityCode['game-state'], async (req) => {
      try {
        // if (RoomManager.checkRoomExist(socket.id)) {
        //   const room = RoomManager.getRoom(socket.id).room;
        //   room.updatePlayerStates(decryptToJson(req.data));
        // } else {
        socket.emit(securityCode["error"], { data: encryptFromJson({ error: `detected cheat: type - Play a game without a room` }) });
        // }
      } catch (err) {
        socket.emit(securityCode["error"], { data: encryptFromJson({ error: err.message }) });
      }
    })
  })
}

export { GameLisnter }