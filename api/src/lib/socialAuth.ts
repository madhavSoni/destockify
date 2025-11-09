import { OAuth2Client } from 'google-auth-library';
import { config } from '../config';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(idToken: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

