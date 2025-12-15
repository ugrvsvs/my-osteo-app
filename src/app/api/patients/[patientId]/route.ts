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
    throw new Error('Error reading data file');
  }
}

export async function GET(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const { patientId } = params;
    const patients = await getPatients();
    const patient = patients.find(p => p.id === patientId);

    if (patient) {
      return NextResponse.json(patient);
    } else {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to read patients data:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const { patientId } = params;
    const updatedData = await request.json();

    const patients = await getPatients();
    
    const patientIndex = patients.findIndex(p => p.id === patientId);

    if (patientIndex === -1) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }
    
    // Update patient data
    patients[patientIndex] = { ...patients[patientIndex], ...updatedData };

    await fs.writeFile(jsonPath, JSON.stringify(patients, null, 2));

    return NextResponse.json(patients[patientIndex]);
  } catch (error) {
    console.error('Failed to update patient:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
  }
}
