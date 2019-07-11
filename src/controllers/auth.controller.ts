import dotenv from "dotenv";
import auth from "google-auth-library";

dotenv.config();
const client = new auth.OAuth2Client(process.env.APP_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        audience: process.env.CLIENT_ID,
        idToken: token,
    });
    const payload = ticket.getPayload();
    return payload.email;

}

export default async function isAuthenticated(req, res, next) {
    if (req.path === "/") {
        return next();
    }
    try {
        const token = req.headers.authorization.split(" ")[1];
        req.email = await verify(token);
        return next();
    } catch (error) {
        res.status(403).send(error);
    }
