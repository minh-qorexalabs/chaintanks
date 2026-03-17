import PlatformModels from "../models";
import { makeNftTankDB } from "./nftTank";
import { makeClassesDB } from "./classes";
import { makeNotifiDB } from "./notification";
import { makeAdminSetDB } from "./adminSetting";
import { makeReferralRewardDB } from "./referralReward";

const NotifiDB = makeNotifiDB(PlatformModels.Notification)
const ReferRewardDB = makeReferralRewardDB(PlatformModels.ReferralReward)
const NftTankDB = makeNftTankDB(PlatformModels.NFTTank)
const ClassesDB = makeClassesDB(PlatformModels.Classes)
const AdminSetDB = makeAdminSetDB(PlatformModels.AdminSetting)

const platformDatas = {
    NotifiDB,
    ReferRewardDB,
    NftTankDB,
    ClassesDB,
    AdminSetDB,
}

export default platformDatas;