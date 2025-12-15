import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { Patient } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const { patientId } = params;
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'patients.json');
    const fileContent = await fs.readFile(jsonPath, 'utf-8');
    const patients: Patient[] = JSON.parse(fileContent);
    
    const patient = patients.find(p => p.id === patientId);

    if (patient) {
      return NextResponse.json(patient);
    } else {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to read patients data:', error);
    return NextResponse.json({ message: 'Error reading data file' }, { status: 500 });
  }
}
