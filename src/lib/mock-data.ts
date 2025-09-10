export const workerTasks = [
    { name: 'System Diagnostic on Unit 7', deadline: '2024-08-15', status: 'In Progress', progress: 60 },
    { name: 'Calibrate Sector B2 Sensors', deadline: '2024-08-12', status: 'Completed', progress: 100 },
    { name: 'Quantum Core Maintenance', deadline: '2024-08-20', status: 'Not Started', progress: 0 },
    { name: 'Deploy Security Patch 3.1.4', deadline: '2024-08-11', status: 'Overdue', progress: 90 },
];

export const attendanceHistory = [
    { date: '2024-08-10', checkIn: '08:42 AM', checkOut: '05:30 PM', status: 'Present' },
    { date: '2024-08-09', checkIn: '08:55 AM', checkOut: '05:35 PM', status: 'Present' },
    { date: '2024-08-08', checkIn: '08:30 AM', checkOut: '05:31 PM', status: 'Present' },
    { date: '2024-08-07', checkIn: '-', checkOut: '-', status: 'Absent' },
    { date: '2024-08-06', checkIn: '09:15 AM', checkOut: '05:45 PM', status: 'Late' },
    { date: '2024-08-05', checkIn: '08:40 AM', checkOut: '05:25 PM', status: 'Present' },
    { date: '2024-08-04', checkIn: '08:50 AM', checkOut: '05:30 PM', status: 'Present' },
];

export const adminWorkers = [
  { id: 1, name: 'Aria Stark', email: 'aria@chronosync.io', role: 'Technician', status: 'Online' },
  { id: 2, name: 'John Snow', email: 'john@chronosync.io', role: 'Engineer', status: 'Offline' },
  { id: 3, name: 'Daenerys Targaryen', email: 'dany@chronosync.io', role: 'Supervisor', status: 'Online' },
  { id: 4, name: 'Tyrion Lannister', email: 'tyrion@chronosync.io', role: 'Administrator', status: 'Online' },
  { id: 5, name: 'Sansa Stark', email: 'sansa@chronosync.io', role: 'Analyst', status: 'Away' },
];

export const adminLogs = [
    { id: 1, date: '2024-08-10', worker: 'Aria Stark', checkIn: '08:42 AM', checkOut: '05:30 PM', hours: '8.80', status: 'Present' },
    { id: 2, date: '2024-08-10', worker: 'John Snow', checkIn: '09:30 AM', checkOut: '06:00 PM', hours: '8.50', status: 'Late' },
    { id: 3, date: '2024-08-10', worker: 'Daenerys Targaryen', checkIn: '08:58 AM', checkOut: '05:32 PM', hours: '8.57', status: 'Present' },
    { id: 4, date: '2024-08-09', worker: 'Aria Stark', checkIn: '08:55 AM', checkOut: '05:35 PM', hours: '8.67', status: 'Present' },
    { id: 5, date: '2024-08-09', worker: 'Sansa Stark', checkIn: '09:05 AM', checkOut: '05:30 PM', hours: '8.42', status: 'Late' },
    { id: 6, date: '2024-08-09', worker: 'Tyrion Lannister', checkIn: '08:30 AM', checkOut: '05:30 PM', hours: '9.00', status: 'Present' },
];
