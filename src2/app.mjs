import express from 'express';
import path from "path";
import bodyParser from "body-parser";
import session from "express-session";
import cors from "cors";
import mongoose from "mongoose";
import errorHandler from "errorhandler";
import morgan from "morgan";
import { routes } from "./routes/fundRoutes"
import dotenv from "dotenv";
import isAuthenticated from "./controllers/authController";
import fs from "fs";
import debugAgent from '@google-cloud/debug-agent';

debugAgent.start();

//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

//Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';

//Initiate our app
const app = express();

//Configure our app
app.use(cors());
app.use(morgan('dev'));
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(path.resolve(), 'public')));
//app.use(session({ secret: 'passport-tutorial', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));
app.use(isAuthenticated);


if(!isProduction) {
  app.use(errorHandler());
  mongoose.set('debug', true);
  dotenv.config();
}

mongoose.set('useFindAndModify', false);
mongoose.connect(process.env.DB_HOST, {useNewUrlParser: true});
routes(app);

const server = app.listen(process.env.PORT || 8080, () => {
  const port = server.address().port;
  console.log(`App listening on port ${port}`);
});

exports.server = server;