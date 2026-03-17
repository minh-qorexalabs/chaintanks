import express from "express";

import User from "./user";
import Platform from "./platform";

const Routes = async (router: express.Router) => {
	//user auth apis
	router.post("/auth/get-password", User.controllers.getPassword);

	router.post("/auth/sinup", User.controllers.signup);
	router.post("/auth/login", User.controllers.login);

	// user apis
	router.post("/user/update-userdata", User.controllers.updateUserData);
	router.post("/user/check-userdata", User.controllers.checkUserData);
	router.post("/user/get-userdata", User.controllers.getUserData);
	router.post("/user/get-alldata", User.controllers.getAllUserData);
	router.post("/user/get-referrals", User.controllers.getReferrals);
	router.post("/user/get-referrerdata", User.controllers.getReferrerInfo);
	router.post("/user/like", User.controllers.like);
	router.post("/user/claim-reward", User.controllers.claimReward);

	// notification apis
	router.post("/user/get-alert", Platform.controllers.getAlert);
	router.post("/user/read-alert", Platform.controllers.readAlert);

	// tanks apis
	router.post("/tanks/classes", Platform.controllers.getTankClasses);
	router.post("/tanks/all-tanks", Platform.controllers.getAlltanks);
	router.post("/tanks/user-tanks", Platform.controllers.getUsertanks);
	router.post("/tanks/get-tanks", Platform.controllers.getTanks);
	router.post("/tanks/get-upgradesign", Platform.controllers.getUpgradeSign);
	router.post("/tanks/update-name", Platform.controllers.updateName);

	router.post("/tanks/borrow", Platform.controllers.borrow);
	router.post("/tanks/lend", Platform.controllers.lend);
	router.post("/tanks/like", Platform.controllers.like);
	router.post("/tanks/update-level", Platform.controllers.updateLevel);

	router.get("/tanks/:id", Platform.controllers.metadata);
	router.get("/metric/total-user", User.controllers.getUsersCount);
	router.get("/metric/online-gamer", User.controllers.getOnlineGamersCount);
	router.get("/metric/online-connects", User.controllers.getOnlineConnectCount);
	router.get("/metric/total-tank", Platform.controllers.getTanksCount);
	router.get("/metric/stake-metric", Platform.controllers.getStakeMetric);
}

export { Routes }