import * as socketIO from 'socket.io'

import { getHash } from '../utils';
import { decryptToJson, encryptFromJson, securityCode } from './utils';

import userDatas from '../user/data-access';
import userService from '../user/services';

const userMiddleware = async (socket: socketIO.Socket) => {
  if (!global.users[socket.id]) {
    socket.emit(securityCode["authError"]);
    return null;
  }
  const userData = await userDatas.UserDB.findOne({
    filter: {
      $and: [
        { name: global.users[socket.id].name },
        { role: { $ne: 'ban' } },
      ]
    }
  })

  global.users[socket.id] = userData._doc;
  return global.users[socket.id];
}

const AuthLisnter = (io: any) => {
  global.users = {};
  global.onlineUsers = 0;

  io.on("connection", async (socket: socketIO.Socket) => {
    console.log('socket connected: ', socket.id);
    global.connectedUsers = io.engine.clientsCount;

    socket.on('disconnect', () => {
      if (global.users[socket.id]?.address) {
        delete global.users[socket.id];
        global.onlineUsers -= 1;
      }

      console.log('socket disconnected: ' + socket.id);
      // if (RoomManager.checkRoomExist(socket.id)) {
      //   RoomManager.deleteRoom(socket.id);
      // }

      global.connectedUsers = io.engine.clientsCount;
    })

    socket.on(securityCode['login'], async (req) => {
      try {
        console.log('socket login: ', socket.id);
        const { name, password } = decryptToJson(req.data);

        console.log("socket login", name, password);
        const hashedPassword = getHash(name, password);
        const userData = await userDatas.UserDB.findOne({
          filter: {
            $and: [
              { name: name },
              { role: { $ne: 'ban' } },
            ]
          }
        })
        console.log("user data:", userData);
        if (!userData) {
          throw new Error("Invalid username");
        }

        if (userData.password !== hashedPassword) {
          throw new Error("Invalid password");
        }

        await userService.updateBorrowTime(userData.address)

        if (!global.users[socket.id]?.address) {
          global.onlineUsers += 1;
        }

        global.users[socket.id] = userData;
        const encryptedData = encryptFromJson({
          name: userData.name,
          address: userData.address,
          email: userData.email,
          avata_url: userData.image,
          merit: userData.merit,
          borrowCount: userData.borrowCount,
          isVip: userData.isVip
        })

        console.log('login event form game client >> : ', socket.id)
        socket.emit(securityCode['loginSuccess'], { data: encryptedData })
      } catch (err) {
        console.error("Auth/logIn : ", err.message)
        const encryptedData = encryptFromJson({ error: err.message })
        socket.emit(securityCode['loginError'], { data: encryptedData })
      }
    })
    // get user data 
    socket.on(securityCode['auth-data'], async (req) => {
      try {
        if (!global.users[socket.id]) {
          return
        }

        const userData = await userDatas.UserDB.findOne({
          filter: {
            $and: [
              { name: global.users[socket.id].name },
              { role: { $ne: 'ban' } },
            ]
          }
        })

        if (!userData) {
          return
        }

        global.users[socket.id] = userData;
        const encryptedData = encryptFromJson({
          name: userData.name,
          address: userData.address,
          email: userData.email,
          avata_url: userData.image,
          merit: userData.merit,
          borrowCount: userData.borrowCount,
        })

        console.log('auth-data event form game client >> ', socket.id);
        // if (RoomManager.checkRoomExist(socket.id)) {
        //   RoomManager.deleteRoom(socket.id);
        // }

        socket.emit(securityCode['loginSuccess'], { data: encryptedData });
      } catch (err) {
        console.error("Auth/logIn : ", err.message);
        const encryptedData = encryptFromJson({ error: err.message });
        socket.emit(securityCode['loginError'], { data: encryptedData })
      }
    })
  })
}

export { AuthLisnter, userMiddleware }