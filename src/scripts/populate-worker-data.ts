
'use server';
import 'dotenv/config';
import * as admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import serviceAccountConfig from '../../serviceAccountKey.json';
import type { ServiceAccount } from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
      const serviceAccount = serviceAccountConfig as ServiceAccount;
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
  } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
      process.exit(1);
  }
}

const db = getFirestore();

const workerId = 'S2a2ogcrwAR8LYx11AxuqhZ3ozf1';

const attendanceLogs = [
  { date: new Date(new Date().setDate(new Date().getDate() - 1)), status: 'Present', checkInHour: 8, checkInMinute: 45, checkOutHour: 17, checkOutMinute: 30 },
  { date: new Date(new Date().setDate(new Date().getDate() - 2)), status: 'Present', checkInHour: 8, checkInMinute: 55, checkOutHour: 17, checkOutMinute: 35 },
  { date: new Date(new Date().setDate(new Date().getDate() - 3)), status: 'Late', checkInHour: 9, checkInMinute: 15, checkOutHour: 17, checkOutMinute: 45 },
  { date: new Date(new Date().setDate(new Date().getDate() - 4)), status: 'Present', checkInHour: 8, checkInMinute: 30, checkOutHour: 17, checkOutMinute: 31 },
  { date: new Date(new Date().setDate(new Date().getDate() - 6)), status: 'Present', checkInHour: 8, checkInMinute: 40, checkOutHour: 17, checkOutMinute: 25 },
];

const tasks = [
    { name: 'System Diagnostic on Unit 7', deadline: '2024-08-15', status: 'In Progress', progress: 60 },
    { name: 'Calibrate Sector B2 Sensors', deadline: '2024-08-12', status: 'Completed', progress: 100 },
    { name: 'Quantum Core Maintenance', deadline: '2024-08-20', status: 'Not Started', progress: 0 },
    { name: 'Deploy Security Patch 3.1.4', deadline: '2024-08-11', status: 'Overdue', progress: 90 },
];

async function populateData() {
  console.log(`Populating data for worker: ${workerId}`);

  // Get worker info to get their name
  const workerSnap = await db.collection('workers').doc(workerId).get();
  if (!workerSnap.exists) {
      console.error(`Error: Worker with ID ${workerId} not found.`);
      process.exit(1);
  }
  const workerName = workerSnap.data()?.name || 'Unknown Worker';
  console.log(`Found worker: ${workerName}`);

  // Populate Attendance Logs
  console.log('Populating attendance logs...');
  const logsBatch = db.batch();
  attendanceLogs.forEach(log => {
    const checkIn = new Date(log.date);
    checkIn.setHours(log.checkInHour, log.checkInMinute);
    const checkOut = new Date(log.date);
    checkOut.setHours(log.checkOutHour, log.checkOutMinute);
    const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

    const logRef = db.collection('attendance-logs').doc();
    logsBatch.set(logRef, {
      workerId,
      workerName,
      checkIn: Timestamp.fromDate(checkIn),
      checkOut: Timestamp.fromDate(checkOut),
      status: log.status,
      hours: parseFloat(hours.toFixed(2)),
    });
  });
  await logsBatch.commit();
  console.log(`${attendanceLogs.length} attendance logs created.`);

  // Populate Tasks
  console.log('Populating tasks...');
  const tasksBatch = db.batch();
  tasks.forEach(task => {
    const taskRef = db.collection('tasks').doc(); // New collection
    tasksBatch.set(taskRef, {
      ...task,
      workerId: workerId,
      assignedAt: Timestamp.now(),
    });
  });
  await tasksBatch.commit();
  console.log(`${tasks.length} tasks created.`);

  console.log('Database population complete!');
  process.exit(0);
}

populateData().catch(error => {
  console.error('Error populating database:', error);
  process.exit(1);
});
