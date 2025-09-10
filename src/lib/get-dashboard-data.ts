
import { cookies } from 'next/headers';
import { db, initAdmin } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import type { AttendanceLog, Worker } from '@/lib/types';
import type { Task } from '@/lib/types';

initAdmin();

export async function getDashboardData() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    console.log('getDashboardData: Attempting to fetch dashboard data...');
    console.log('getDashboardData: Session cookie:', sessionCookie ? 'Found' : 'Not found');
    
    if (!sessionCookie) {
        console.error('getDashboardData: No session cookie found, aborting.');
        return null;
    }

    try {
        const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
        console.log('getDashboardData: Session verified successfully, user ID:', decodedClaims.uid);
        const workerId = decodedClaims.uid;

        const workerDoc = await db.collection('workers').doc(workerId).get();
        if (!workerDoc.exists) {
            console.error(`getDashboardData: Worker document not found in Firestore for UID: ${workerId}`);
            return null;
        }
        console.log(`getDashboardData: Found worker document for UID: ${workerId}`);
        const worker = { id: workerDoc.id, ...workerDoc.data() } as Worker;

        // Fetch today's attendance log
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const logsSnapshot = await db.collection('attendance-logs')
            .where('workerId', '==', workerId)
            .where('checkIn', '>=', Timestamp.fromDate(today))
            .where('checkIn', '<', Timestamp.fromDate(tomorrow))
            .limit(1)
            .get();
        
        console.log(`getDashboardData: Found ${logsSnapshot.size} attendance log(s) for today.`);
        
        let attendanceLog: (AttendanceLog & { id: string }) | null = null;
        if (!logsSnapshot.empty) {
            const doc = logsSnapshot.docs[0];
            const data = doc.data();
            attendanceLog = {
                id: doc.id,
                ...data,
                checkIn: (data.checkIn as Timestamp).toDate(),
                checkOut: data.checkOut ? (data.checkOut as Timestamp).toDate() : null,
            } as AttendanceLog & { id: string };
        }
        
        // Fetch tasks
        const tasksSnapshot = await db.collection('tasks')
            .where('workerId', '==', workerId)
            .orderBy('deadline', 'asc')
            .get();

        const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        console.log(`getDashboardData: Found ${tasks.length} tasks.`);


        // Calculate attendance streak
        let streak = 0;
        let consecutive = true;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Check if there is a log for today
        const todayStart = Timestamp.fromDate(currentDate);
        const todayEnd = Timestamp.fromMillis(todayStart.toMillis() + 24 * 60 * 60 * 1000);
        const todayLogSnapshot = await db.collection('attendance-logs')
            .where('workerId', '==', workerId)
            .where('checkIn', '>=', todayStart)
            .where('checkIn', '<', todayEnd)
            .get();
        
        if (!todayLogSnapshot.empty) {
            streak++;
        } else {
            consecutive = false; // No log today, streak must be 0
        }

        if (consecutive) {
             for (let i = 1; i < 30; i++) { // Check up to 29 previous days
                let checkDate = new Date();
                checkDate.setDate(checkDate.getDate() - i);
                checkDate.setHours(0,0,0,0);
                
                const dayStart = Timestamp.fromDate(checkDate);
                const dayEnd = Timestamp.fromMillis(dayStart.toMillis() + 24 * 60 * 60 * 1000);

                const streakLogSnapshot = await db.collection('attendance-logs')
                    .where('workerId', '==', workerId)
                    .where('checkIn', '>=', dayStart)
                    .where('checkIn', '<', dayEnd)
                    .get();

                if (!streakLogSnapshot.empty) {
                    streak++;
                } else {
                    break; // Streak broken
                }
            }
        }
        console.log(`getDashboardData: Calculated attendance streak: ${streak} days.`);
        console.log('getDashboardData: Successfully fetched all data.');
        return { worker, attendanceLog, streak, tasks };
    } catch(error) {
        console.error("getDashboardData: Error fetching dashboard data", error);
        // If the cookie is invalid, it will throw an error, so we return null
        return null;
    }
}
