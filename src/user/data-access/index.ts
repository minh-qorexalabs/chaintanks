import UserModels from "../models";
import { makeUserDB } from "./users";

const UserDB = makeUserDB(UserModels.Users);

const userDatas = {
    UserDB,
}

export default userDatas;