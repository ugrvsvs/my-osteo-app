import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { Patient } from '@/lib/types';

export async function GET() {
  try {
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'patients.json');
    const fileContent = await fs.readFile(jsonPath, 'utf-8');
    const patients: Patient[] = JSON.parse(fileContent);
    return NextResponse.json(patients);
  } catch (error) {
    console.error('Failed to read patients data:', error);
    return NextResponse.json({ message: 'Error reading data file' }, { status: 500 });
  }
}
