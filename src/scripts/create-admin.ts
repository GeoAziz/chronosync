import 'dotenv/config';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

const email = 'golfr@workflow.io';
const password = 'password123';

async function createAdminUser() {
  try {
    console.log('Creating new admin user...');
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      emailVerified: true,
      disabled: false,
    });

    console.log('Successfully created new user:', userRecord.uid);

    console.log('Setting custom claims...');
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    
    console.log('Custom claims set successfully.');
    
    console.log('Storing user in Firestore...');
    await db.collection('users').doc(userRecord.uid).set({
        email: userRecord.email,
        role: 'admin',
        createdAt: new Date().toISOString()
    });

    console.log('Admin user created and configured successfully!');
    process.exit(0);

  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
        console.error('Error: Email already exists. Fetching user to update claims.');
        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            console.log('Setting custom claims for existing user:', userRecord.uid);
            await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
            console.log('Custom claims set successfully for existing user.');

            console.log('Updating user in Firestore...');
             await db.collection('users').doc(userRecord.uid).set({
                email: userRecord.email,
                role: 'admin',
            }, { merge: true });

            console.log('Existing admin user configured successfully!');

            process.exit(0);
        } catch(e) {
             console.error('Error configuring existing user:', e);
             process.exit(1);
        }

    } else {
        console.error('Error creating new user:', error);
        process.exit(1);
    }
  }
}

createAdminUser();
