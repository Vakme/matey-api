import auth from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();
const client = new auth.OAuth2Client(process.env.APP_ID);

async function verify(token) {
  console.log(client);
  console.log("BEEEEF");
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID,
  });
  console.log("AAAAAF");
  const payload = ticket.getPayload();
  return payload['email'];
  
}

export default async function isAuthenticated(req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    req.email = await verify(token);
    return next();
  }
  catch (error) {
    res.status(403).send(error)
  }
  
}