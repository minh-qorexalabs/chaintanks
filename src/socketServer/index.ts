// import cron from "node-cron"
import { Server } from 'socket.io'
// import * as socketIO from 'socket.io'

import { GameLisnter } from "./gameSocket"
import { AuthLisnter, userMiddleware } from "./authSocket"

export const setupSocketServer = (server: any) => {
  let ipDatas: any = {}

  const io = new Server(server, {
    allowRequest: (req, callback) => {
      let websocketKey = req.headers["sec-websocket-key"] || "x";
      let ip: any = req.headers["x-real-ip"];
      let sockets = ipDatas[ip] || [];

      console.log("ip", ip);
      if (sockets.length > 3) {
        // disable connection
        console.log("req.headers.origin", req.headers["x-real-ip"]);
        callback(null, true);
      } else {
        sockets = [...sockets, websocketKey];
        ipDatas[ip] = sockets;
        console.log("ip", ipDatas[ip]);
        callback(null, true);
      }
    },
    pingInterval: 30005,		//An interval how often a ping is sent
    pingTimeout: 5000,		//The time a client has to respont to a ping before it is desired dead
    upgradeTimeout: 3000,		//The time a client has to fullfill the upgrade
    allowUpgrades: true,		//Allows upgrading Long-Polling to websockets. This is strongly recommended for connecting for WebGL builds or other browserbased stuff and true is the default.
    cookie: false,			//We do not need a persistence cookie for the demo - If you are using a load balöance, you might need it.
    serveClient: true,		//This is not required for communication with our asset but we enable it for a web based testing tool. You can leave it enabled for example to connect your webbased service to the same server (this hosts a js file).
    allowEIO3: false,			//This is only for testing purpose. We do make sure, that we do not accidentially work with compat mode.
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  AuthLisnter(io)
  GameLisnter(io, userMiddleware)

  // io.on('connection', (socket: socketIO.Socket) => {
  //   console.log(socket.id + ' user connected.')
  //   const clientId = socket.id
  // })

  // Gracefully handle application termination
  const closeServer = () => {
    server.close(() => {
      console.log('Socket server closed');
      process.exit(0);
    });
  }

  process.on('SIGINT', closeServer); // Handle CTRL+C
  process.on('SIGTERM', closeServer); // Handle termination signals
}