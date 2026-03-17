import BlockchainModels from "../models";
import { makeTxHistoryDB } from "./txHistory";
import { makeBlockNumDB } from "./blockNumber";

const BlockNumDB = makeBlockNumDB(BlockchainModels.BlockNumber)
const TxHistoryDB = makeTxHistoryDB(BlockchainModels.TxHistory)

const blockchainDatas = {
  BlockNumDB,
  TxHistoryDB,
}

export default blockchainDatas;