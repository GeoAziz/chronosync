
'use server';
import { suggestWorkerRole, type SuggestWorkerRoleInput } from '@/ai/flows/suggest-worker-role';
import { auth, db, initAdmin } from './firebase-admin';
import { revalidatePath } from 'next/cache';

initAdmin();

export async function suggestWorkerRoleAction(input: SuggestWorkerRoleInput) {
  try {
    const result = await suggestWorkerRole(input);
    return result;
  } catch (error) {
    console.error(error);
    return { suggestedRole: '' };
  }
}


type AddWorkerInput = {
    name: string;
    email: string;
    role: string;
    description: string;
}

export async function addWorkerAction(input: AddWorkerInput) {
    try {
        const { name, email, role } = input;
        
        // 1. Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            emailVerified: true, // We can consider the email verified as admin is adding it.
            password: `disabled-password-${Date.now()}`, // Set a long, random, unusable password.
            displayName: name,
            disabled: false,
        });

        // 2. Add worker to Firestore 'workers' collection
        await db.collection('workers').doc(userRecord.uid).set({
            name,
            email,
            role,
            status: 'Invited', // New status for invited users
            createdAt: new Date().toISOString(),
        });
        
        // 3. Generate password reset link
        const link = await auth.generatePasswordResetLink(email);

        revalidatePath('/admin/workers');
        return { success: true, link };

    } catch (error: any) {
        console.error("Error adding worker:", error);
        // Provide more specific error messages if possible
        if (error.code === 'auth/email-already-exists') {
            return { success: false, error: 'A user with this email already exists.' };
        }
        return { success: false, error: "An unexpected error occurred. Please try again." };
    }
}

type UpdateWorkerInput = {
    id: string;
    name: string;
    role: string;
}

export async function updateWorkerAction(input: UpdateWorkerInput) {
    try {
        const { id, name, role } = input;
        
        // 1. Update user in Firebase Auth
        await auth.updateUser(id, {
            displayName: name,
        });

        // 2. Update worker in Firestore 'workers' collection
        await db.collection('workers').doc(id).update({
            name,
            role,
        });
        
        revalidatePath('/admin/workers');
        return { success: true };

    } catch (error: any) {
        console.error("Error updating worker:", error);
        return { success: false, error: "An unexpected error occurred. Please try again." };
    }
}

export async function deleteWorkerAction(workerId: string) {
    try {
        // 1. Delete from Firestore
        await db.collection('workers').doc(workerId).delete();

        // 2. Delete from Firebase Auth
        await auth.deleteUser(workerId);

        revalidatePath('/admin/workers');
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting worker:", error);
        return { success: false, error: "An unexpected error occurred. Please try again." };
    }
}


'use server';

export async function signInAction(formData: FormData) {
    const workerId = formData.get('workerId') as string;
    const workerName = formData.get('workerName') as string;
    try {
        const now = new Date();
        const checkInHour = now.getHours();
        const checkInMinute = now.getMinutes();

        const isLate = checkInHour > 9 || (checkInHour === 9 && checkInMinute > 0);
        const status = isLate ? 'Late' : 'Present';

        await db.collection('attendance-logs').add({
            workerId,
            workerName,
            checkIn: now,
            checkOut: null,
            status: status,
            hours: 0,
        });
        
        await db.collection('workers').doc(workerId).update({ status: 'Online' });

        revalidatePath('/worker/dashboard');
        return { success: true, message: `Signed in at ${now.toLocaleTimeString()}` };
    } catch (error) {
        console.error("Sign-in error:", error);
        return { success: false, error: "Failed to sign in." };
    }
}

export async function signOutAction(formData: FormData) {
    const logId = formData.get('logId') as string;
    const workerId = formData.get('workerId') as string;
     try {
        const now = new Date();
        const logRef = db.collection('attendance-logs').doc(logId);
        const logDoc = await logRef.get();

        if (!logDoc.exists) {
            return { success: false, error: "Log not found." };
        }

        const logData = logDoc.data();
        const checkInTime = (logData?.checkIn as FirebaseFirestore.Timestamp).toDate();
        
        const hoursWorked = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

        await logRef.update({
            checkOut: now,
            hours: parseFloat(hoursWorked.toFixed(2)),
        });
        
        await db.collection('workers').doc(workerId).update({ status: 'Offline' });

        revalidatePath('/worker/dashboard');
        return { success: true, message: `Signed out at ${now.toLocaleTimeString()}` };
    } catch (error) {
        console.error("Sign-out error:", error);
        return { success: false, error: "Failed to sign out." };
    }
}
