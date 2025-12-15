import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { Patient } from '@/lib/types';

// Define the path to the JSON file
const jsonPath = path.join(process.cwd(), 'src', 'data', 'patients.json');

// Helper function to read patients from the file
async function getPatients(): Promise<Patient[]> {
  try {
    const fileContent = await fs.readFile(jsonPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // If the file doesn't exist or is empty, return an empty array
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    console.error('Failed to read patients data:', error);
    throw new Error('Error reading data file');
  }
}

export async function GET() {
  try {
    const patients = await getPatients();
    return NextResponse.json(patients);
  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const newPatientData = await request.json();
        const patients = await getPatients();

        // Basic validation
        if (!newPatientData.name || !newPatientData.email) {
            return NextResponse.json({ message: 'Name and email are required' }, { status: 400 });
        }

        const newPatient: Patient = {
            id: String(Date.now()), // Simple unique ID generation
            name: newPatientData.name,
            email: newPatientData.email,
            avatarUrl: newPatientData.avatarUrl || `https://picsum.photos/seed/${Date.now()}/400/400`,
            shareId: `share-${newPatientData.name.split(' ')[0].toLowerCase()}-${Math.random().toString(36).substr(2, 5)}`,
            assignedExercises: [],
            activityLog: [],
        };
        
        patients.push(newPatient);

        await fs.writeFile(jsonPath, JSON.stringify(patients, null, 2));

        return NextResponse.json(newPatient, { status: 201 });

    } catch (error) {
        console.error('Failed to create patient:', error);
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
    }
}
