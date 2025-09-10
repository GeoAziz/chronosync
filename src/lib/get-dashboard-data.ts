
import { cookies } from 'next/headers';
import { db, initAdmin } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import type { AttendanceLog, Worker } from '@/lib/types';
import type { Task } from '@/lib/types';

initAdmin();

async function calculateStreak(workerId: string): Promise<number> {
    console.log(`getDashboardData: Calculating attendance streak for worker ${workerId}...`);
    const logsSnapshot = await db.collection('attendance-logs')
        .where('workerId', '==', workerId)
        .orderBy('checkIn', 'desc')
        .limit(30) // Look at the last 30 logs for a reasonable streak cap
        .get();

    if (logsSnapshot.empty) {
        console.log('getDashboardData: No logs found, streak is 0.');
        return 0;
    }

    const logDates = logsSnapshot.docs.map(doc => {
        const checkIn = (doc.data().checkIn as Timestamp).toDate();
        // Normalize to the start of the day
        return new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
    });
    
    // Remove duplicate dates (in case of multiple sign-ins in a day)
    const uniqueLogDates = [...new Set(logDates.map(d => d.getTime()))].map(t => new Date(t));

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Find if the latest log is for today or yesterday
    const latestLogDate = new Date(Math.max(...uniqueLogDates.map(d => d.getTime())));

    let currentDate: Date;
    if (latestLogDate.getTime() === today.getTime()) {
        currentDate = today;
    } else if (latestLogDate.getTime() === yesterday.getTime()) {
        currentDate = yesterday;
    } else {
        // If the latest log is not from today or yesterday, the streak is 0
        console.log('getDashboardData: Latest log is not today or yesterday, streak is 0.');
        return 0;
    }

    // Loop backwards from the starting date to count the streak
    for (let i = 0; i < uniqueLogDates.length; i++) {
        const expectedDate = new Date(currentDate);
        expectedDate.setDate(expectedDate.getDate() - i);
        
        const hasLogForExpectedDate = uniqueLogDates.some(logDate => logDate.getTime() === expectedDate.getTime());

        if (hasLogForExpectedDate) {
            streak++;
        } else {
            // Streak is broken
            break;
        }
    }
    
    console.log(`getDashboardData: Calculated attendance streak: ${streak} days.`);
    return streak;
}


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
        const workerId = decodedClaims.uid;
        console.log('getDashboardData: Session verified successfully, user ID:', workerId);

        const workerDoc = await db.collection('workers').doc(workerId).get();
        if (!workerDoc.exists) {
            console.error(`getDashboardData: Worker document not found in Firestore for UID: ${workerId}`);
            return null;
        }
        const worker = { id: workerDoc.id, ...workerDoc.data() } as Worker;
        console.log(`getDashboardData: Found worker document for UID: ${workerId}`);

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

        const tasks = tasksSnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data,
                assignedAt: (data.assignedAt as Timestamp).toDate().toISOString()
            } as Task
        });
        console.log(`getDashboardData: Found ${tasks.length} tasks.`);
        
        const streak = await calculateStreak(workerId);
        
        console.log('getDashboardData: Successfully fetched all data.');
        return { worker, attendanceLog, streak, tasks };

    } catch(error) {
        console.error("getDashboardData: Error fetching dashboard data", error);
        return null;
    }
}
