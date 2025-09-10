
export type Worker = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'Online' | 'Offline' | 'Away' | 'Invited';
    createdAt?: string;
};

export type AttendanceLog = {
    id: string;
    workerId: string;
    workerName: string;
    checkIn: Date;
    checkOut: Date | null;
    status: 'Present' | 'Late' | 'Absent';
    hours: number;
};
