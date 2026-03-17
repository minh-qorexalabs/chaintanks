import ipfsAPI from "ipfs-api"
import { v4 as uuidv4 } from 'uuid';
import { Response, Request } from "express";

import { config } from "../../config";
import { getHash } from "../../utils";
import { toChecksumAddress } from "../../utils/blockchain";

import AuthController from "./auth";
import userService from "../services";
import userDatas from "../data-access";
import platformDatas from "../../platform/data-access";
import blockchainService from "../../blockchain/services";

const ipfs = ipfsAPI(
	config.ipfs.host,
	config.ipfs.port,
	{ protocol: config.ipfs.opt, }
);

const userController = {
	checkAuthStatus: async (req: Request, res: Response) => {
		return res.status(200).json({ status: true });
	},

	// Auth controller
	login: AuthController.login,
	signup: AuthController.signup,
	middleware: AuthController.middleware,
	getPassword: AuthController.getPassword,

	// User controller
	updateUserData: async (req: any, res: Response) => {
		try {
			const { name, email, password } = req.body;
			const { description, links, signature } = req.body;

			const message = "welcome " + name
			const address = await blockchainService.getAddrFromSig(message, signature)

			const hashedPassword = getHash(name, password);
			const tempAddress = toChecksumAddress(address);

			// service
			if (!userService.verifySignature({ sig: signature, address })) {
				throw new Error("invalid signature")
			}

			const existsMail = await userService.checkUpdateAccount({
				name, email, address
			})

			if (existsMail.res === true) {
				throw new Error(`${existsMail.param} is already exist!`);
			}

			const userData = await userDatas.UserDB.findOne({
				filter: { address: tempAddress }
			})

			const imageData = req.files?.image?.data
			const coverImageData = req.files?.coverImage?.data

			if (userData) {
				let imageUrl = userData.image
				let coverImgUrl = userData.coverImage

				if (imageData) {
					let [imgResult] = await ipfs.files.add(imageData);
					imageUrl = config.ipfs.baseUrl + imgResult.hash
				}

				if (coverImageData) {
					let [coverImgResult] = await ipfs.files.add(coverImageData);
					coverImgUrl = config.ipfs.baseUrl + coverImgResult.hash
				}

				await userDatas.UserDB.update({
					filter: { address: tempAddress },
					update: {
						name: name,
						email: email,
						password: hashedPassword,
						description: description,
						links: JSON.parse(links),

						image: imageUrl,
						coverImage: coverImgUrl,
					}
				})
			} else {
				if (!imageData || !coverImageData) {
					throw new Error("image or coverImage not exists");
				}

				const referralCode = userService.createReferralCode()
				const [imgResult] = await ipfs.files.add(imageData);
				const [coverImgResult] = await ipfs.files.add(coverImageData);
				const coverImgUrl = config.ipfs.baseUrl + coverImgResult.hash
				const imageUrl = config.ipfs.baseUrl + imgResult.hash

				await userDatas.UserDB.create({
					name: name,
					email: email,
					address: tempAddress,
					password: hashedPassword,
					description: description,
					referralCode: referralCode,
					links: JSON.parse(links),

					image: imageUrl,
					coverImage: coverImgUrl,
				})
			}

			const user = await userDatas.UserDB.findOne({
				filter: { address: tempAddress }
			})

			const ranking = await userDatas.UserDB.findRank({
				filter: { address: tempAddress }
			})

			const resData = {
				name: user.name,
				email: user.email,
				address: user.address,
				image: user.image,
				coverImage: user.coverImage,
				description: user.description,
				links: user.links,
				merit: user.merit,
				follows: user.followers.length,
				ranking: ranking,
			}

			return res.json(resData)
		} catch (err) {
			console.error("Auth/updateUserData : ", err.message);
			res.status(500).json({ error: err.message });
		}
	},

	checkUserData: async (req: any, res: Response) => {
		try {
			const { name, email, address } = req.body;

			const existsMail = await userService.checkUpdateAccount({
				name, email, address: address
			})

			let isValid = false
			if (existsMail.res !== true) {
				isValid = true
			}

			return res.json({ isValid: isValid });
		} catch (err) {
			console.error("Auth/checkUserData : ", err.message);
			return res.status(500).json({ error: err.message });
		}
	},

	getUserData: async (req: any, res: Response) => {
		try {
			const { address } = req.body;

			const user = await userDatas.UserDB.findOne(({
				filter: { address: address }
			}))

			if (!user) {
				const resData = {
					name: "Player",
					email: "",
					address: address,
					image: "",
					coverImage: "",
					description: "",
					links: [],
					merit: 0,
					follows: 0,
					ranking: -1,
				}

				return res.json(resData)
			} else {
				let ranking = await userDatas.UserDB.findRank({
					filter: { address: address }
				})

				let borrowCount = await userService.updateBorrowTime(address)

				const resData = {
					name: user.name,
					email: user.email,
					address: user.address,
					image: user.image,
					coverImage: user.coverImage,
					description: user.description,
					links: user.links,
					merit: user.merit,
					follows: user.followers.length,
					ranking: ranking,
					role: user.role,
					borrowCount: borrowCount
				}

				return res.json(resData)
			}
		} catch (err) {
			console.error("Auth/getUserData : ", err.message);
			return res.status(500).json({ error: err.message });
		}
	},

	getAllUserData: async (req: any, res: Response) => {
		try {
			let users = await userDatas.UserDB.find({ filter: {} })

			users = users.map(user => ({
				name: user.name,
				address: user.address,
				image: user.image,
				coverImage: user.coverImage,
				merit: user.merit,
				referrer: user.referrer,
				referrallers: user.referrallers,
				role: user.role,
			}))

			return res.json(users);
		} catch (err) {
			console.log("Auth/getAllUserData : ", err.message);
			res.status(500).json({ error: err.message });
		}
	},

	getReferrals: async (req: any, res: Response) => {
		try {
			const { to } = req.body;

			const user = await userDatas.UserDB.findOne({
				filter: { address: to }
			})

			if (!user) {
				return res.json({});
			} else {
				const resData = {
					name: user.name,
					address: user.address,
					image: user.image,
					coverImage: user.coverImage,
					referrer: user.referrer,
					referralCode: user.referralCode,
					referrallers: user.referrallers,
					referralReward: user.referralReward
				}

				return res.json(resData)
			}
		} catch (err) {
			console.log("Auth/getReferrals : ", err.message);
			res.status(500).json({ error: err.message });
		}
	},

	getReferrerInfo: async (req: any, res: Response) => {
		try {
			const { referrers } = req.body;
			let referralers = [];
			if (referrers instanceof Array && referrers.length > 0) {
				for (let i = 0; i < referrers.length; i++) {
					const ref = await userDatas.UserDB.findOne({
						filter: { address: referrers[i] }
					})

					referralers.push(ref)
				}
			} else {
				return res.json([]);
			}

			let resData = referralers.map(user => ({
				name: user.name,
				address: user.address,
				image: user.image,
				coverImage: user.coverImage
			}))

			return res.json(resData);
		} catch (err) {
			console.log("Auth/getAllUserData : ", err.message);
			res.status(500).json({ error: err.message });
		}
	},

	like: async (req: any, res: Response) => {
		try {
			const { to, signature } = req.body;
			const address = await blockchainService.getAddrFromSig(to, signature)

			let user = await userDatas.UserDB.findOne({
				filter: { address: address }
			})

			if (!user) {
				throw new Error("invalid user");
			}

			let followerIndex = user.followers.findIndex(
				(follower) => follower == address
			)

			if (followerIndex != -1) {
				// unlike
				user.followers.splice(followerIndex, 1);
			} else {
				// like
				user.followers = [...user.followers, address];
			}

			await userDatas.UserDB.update({
				filter: { address: address },
				update: { followers: user.followers }
			})

			return res.status(200).json({ status: true, data: user });
		} catch (err) {
			console.error("gameApi/getUpgradeSign : ", err.message);
			return res.status(500).json({ error: err.message });
		}
	},

	claimReward: async (req: any, res: Response) => {
		try {
			const { address } = req.body;

			const user = await userDatas.UserDB.findOne({
				filter: { address: address }
			})

			const result = await platformDatas.ReferRewardDB.create({
				user: user,
				amount: user.referralReward
			})

			return res.json(result);
		} catch (err) {
			console.log("Auth/claimReward : ", err.message);
			res.status(500).json({ error: err.message });
		}
	},

	getUsersCount: async (req: any, res: Response) => {
		try {
			const result = await userDatas.UserDB.find({
				filter: {}
			})

			return res.json({ data: result.length });
		} catch (err) {
			console.log("Auth/getUserCount : ", err.message);
			res.status(500).json({ error: err.message });
		}
	},

	getOnlineGamersCount: async (req: any, res: Response) => {
		try {
			// console.log(global.users, Object.keys(global.users).length);
			return res.json({ data: global.onlineUsers });
		} catch (err) {
			console.log("Auth/getUserCount : ", err.message);
			res.status(500).json({ error: err.message });
		}
	},

	getOnlineConnectCount: async (req: any, res: Response) => {
		try {
			// console.log(global.users, Object.keys(global.users).length);
			return res.json({ data: global.connectedUsers });
		} catch (err) {
			console.log("Auth/getUserCount : ", err.message);
			res.status(500).json({ error: err.message });
		}
	},
}

export default userController;
