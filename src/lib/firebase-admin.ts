
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import dotenv from 'dotenv';

dotenv.config();

// This function can be called multiple times, but it will only initialize the app once.
export function initAdmin() {
  if (!getApps().length) {
    try {
        const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (!serviceAccountString) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
        }
        
        const serviceAccount = JSON.parse(serviceAccountString);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch(error) {
        console.error("Failed to initialize Firebase Admin SDK", error);
        // We throw the error to make it visible in the server logs
        throw error;
    }
  }
}

// Initialize for any server-side code that needs it up front
initAdmin();

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
