import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { Patient } from '@/lib/types';

const jsonPath = path.join(process.cwd(), 'src', 'data', 'patients.json');

async function getPatients(): Promise<Patient[]> {
  try {
    const fileContent = await fs.readFile(jsonPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw new Error('Error reading patients data file');
  }
}

export async function POST(request: Request) {
  try {
    const { patientId, videoId } = await request.json();

    if (!patientId || !videoId) {
      return NextResponse.json({ message: 'patientId and videoId are required' }, { status: 400 });
    }

    const patients = await getPatients();
    const patientIndex = patients.findIndex(p => p.id === patientId);

    if (patientIndex === -1) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }

    const newLogEntry = {
      id: `log${Date.now()}`,
      videoId,
      timestamp: new Date().toISOString(),
      action: 'opened' as const,
    };

    // Ensure activityLog exists
    if (!patients[patientIndex].activityLog) {
      patients[patientIndex].activityLog = [];
    }
    
    // Add new log and update last activity
    patients[patientIndex].activityLog.push(newLogEntry);
    patients[patientIndex].lastActivity = newLogEntry.timestamp;

    await fs.writeFile(jsonPath, JSON.stringify(patients, null, 2));

    return NextResponse.json({ success: true, message: 'Activity logged' });
  } catch (error) {
    console.error('Failed to log activity:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
}
