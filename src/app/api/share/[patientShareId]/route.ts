import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import type { Patient, Video } from '@/lib/types';

const patientsPath = path.join(process.cwd(), 'src', 'data', 'patients.json');
const videosPath = path.join(process.cwd(), 'src', 'data', 'videos.json');

async function readData<T>(filePath: string): Promise<T[]> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw new Error(`Error reading data file: ${filePath}`);
  }
}

export async function GET(
  request: Request,
  { params }: { params: { patientShareId: string } }
) {
  try {
    const { patientShareId } = params;
    
    if (!patientShareId) {
        return NextResponse.json({ message: 'Patient share ID is required' }, { status: 400 });
    }

    const [patients, videos] = await Promise.all([
      readData<Patient>(patientsPath),
      readData<Video>(videosPath)
    ]);

    const patient = patients.find(p => p.shareId === patientShareId);

    if (!patient) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }
    
    // Combine patient data with video details
    const assignedExercisesWithDetails = patient.assignedExercises
      .map(assignment => {
        const video = videos.find(v => v.id === assignment.videoId);
        if (!video) return null; // or handle as an error
        return { ...assignment, video };
      })
      .filter(item => item !== null)
      .sort((a, b) => a.order - b.order);
      
    const publicPatientData = {
        ...patient,
        assignedExercises: assignedExercisesWithDetails
    };

    return NextResponse.json(publicPatientData);

  } catch (error) {
    console.error('Failed to get patient share data:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
  }
}
