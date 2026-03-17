import cors from "cors";
import express from "express";
import passport from "passport"
import mongoose from "mongoose";
import bodyParser from "body-parser"
import rateLimit from 'express-rate-limit'
import fileUpload from 'express-fileupload';
// External Modules
// import './subscribe/events'
import { config } from './config';
import { Routes } from "./Routes";
import { setlog } from "./utils/setlog";
//import { initHandler } from "./blockchain/api";
import { setupSocketServer } from "./socketServer";

// Get router
const router: express.Router = express.Router();
const app: express.Express = express();
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 20000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const connectDatabase = async (mongoUrl: string) => {
	try {
		const options = {
			autoCreate: true,
			keepAlive: true,
			retryReads: true,
		} as mongoose.ConnectOptions;
		mongoose.set("strictQuery", true);
		const result = await mongoose.connect(mongoUrl, options);
		if (result) {
			setlog("MongoDB connected");
		}
	} catch (err) {
		setlog("ConnectDatabase", err);
	}
};

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload({
	limits: { fileSize: 50 * 1024 * 1024 }
}));

// Passport middleware
app.use(passport.initialize());

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*", methods: ["POST", "GET"] }));
app.use(express.json());
app.use(limiter)

// Frontend Render
if (!config.DEBUG) {
	app.use(express.static(__dirname + "/build"));
	app.get("/*", function (req, res) {
		res.sendFile(__dirname + "/build/index.html", function (err) {
			if (err) {
				res.status(500).send(err);
			}
		});
	});
}

// API Router
Routes(router);
app.use("/api", router);
const mongoUrl = `mongodb+srv://${config.DB_USERNAME}:${config.DB_PASSWARD}@cluster0.nttan.mongodb.net/${config.DB_NAME}?retryWrites=true&w=majority&appName=${config.DB_APP_NAME}`;
connectDatabase(mongoUrl).then(() => {
	// run blockchain handler
	// initHandler();

	const server = app.listen(config.PORT, () => {
		setlog(`Server listening on ${config.PORT} port`);
	});

	// // run socket server
	setupSocketServer(server)
}).catch((err: any) => {
	setlog(err);
});

export default app;