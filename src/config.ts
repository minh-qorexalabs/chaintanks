import { config as dotenv } from 'dotenv';
dotenv()

export const config = {
  PORT: Number(process.env.PORT),
  DATABASE: process.env.DATABASE,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWARD: process.env.DB_PASSWARD,
  DB_NAME: process.env.DB_NAME,
  DB_APP_NAME: process.env.DB_APP_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
  CHAINID: Number(process.env.CHAINID),
  DEBUG: process.env.DEBUG === 'true' ? true : false,

  startDate: '2023-02-13',
  ADMINWALLET: process.env.ADMINWALLET,

  ipfs: {
    baseUrl: process.env.PFS_BASEURL,
    host: process.env.IPFS_HOST,
    port: process.env.IPFS_PORT,
    opt: process.env.IPFS_OPT,
  },
} 