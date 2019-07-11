import cors from "cors";
import dotenv from "dotenv";
import errorHandler from "errorhandler";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import "reflect-metadata";
import { useExpressServer } from "routing-controllers";
import {FundController} from "./controllers/fund.controller";

const isProduction = process.env.NODE_ENV === "production";
// mongoose.Promise = global.Promise;
const port = 8080; // default port to listen
const app = express();
app.use(cors());
app.use(morgan("dev"));

if (!isProduction) {
    app.use(errorHandler());
    mongoose.set("debug", true);
    dotenv.config();
}

mongoose.set("useFindAndModify", false);
mongoose.connect(process.env.DB_HOST, {useNewUrlParser: true});

useExpressServer(app, {
    controllers: [FundController]
});

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );
