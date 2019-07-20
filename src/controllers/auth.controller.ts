import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import {Action} from "routing-controllers";

const isProduction = process.env.NODE_ENV === "production";
if (!isProduction) {
    // dotenv.config();
}
const client = new OAuth2Client(process.env.APP_ID);

// @ts-ignore
async function verify(token) {
    const ticket = await client.verifyIdToken({
        audience: process.env.CLIENT_ID,
        idToken: token,
    });
    const payload = ticket.getPayload();
    return payload.email;

}

export async function isAuthenticated(action: Action) {
    if (process.env.TEST) {
       return process.env.TEST_EMAIL;
    }
    try {
        const token = action.request.headers.authorization.split(" ")[1];
        return await verify(token);
    } catch (error) {
        console.log(error);
        return;
    }
}
