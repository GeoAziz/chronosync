
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import type { ServiceAccount } from 'firebase-admin';
// Import service account credentials directly
import serviceAccountConfig from '../../serviceAccountKey.json';

// This function can be called multiple times, but it will only initialize the app once.
export function initAdmin() {
  if (!getApps().length) {
    try {
        // Use the imported service account config
        const serviceAccount = serviceAccountConfig as ServiceAccount;

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
