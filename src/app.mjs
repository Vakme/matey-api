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
mongoose.connect('mongodb://localhost/matey', {useNewUrlParser: true});
routes(app);
app.listen(8000, "matey.io", () => console.log('Server running on http://matey.io:8000/'));