import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import errorHandler from "errorhandler";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import "reflect-metadata";
import { useExpressServer } from "routing-controllers";
import ArchiveController from "./controllers/archive.controller";
import { isAuthenticated } from "./controllers/auth.controller";
import FundController from "./controllers/fund.controller";
import HealthController from "./controllers/health.controller";
import ShopListController from "./controllers/shoplist.controller";
import SummaryController from "./controllers/summary.controller";
import TypeController from "./controllers/type.controller";

const isProduction = process.env.NODE_ENV === "production";
// mongoose.Promise = global.Promise;
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));

if (!isProduction) {
    app.use(errorHandler());
    mongoose.set("debug", true);
    dotenv.config();
}
const port = process.env.PORT || 8080; // default port to listen

mongoose.set("useFindAndModify", false);
mongoose.connect(process.env.DB_HOST, {useNewUrlParser: true});

useExpressServer(app, {
    controllers: [
        FundController,
        ArchiveController,
        TypeController,
        SummaryController,
        ShopListController,
        HealthController],
    currentUserChecker: isAuthenticated,
});

// start the Express server
const server = app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );

export default server;
