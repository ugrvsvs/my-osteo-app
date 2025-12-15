import { notFound } from 'next/navigation';
import { PatientView } from './_components/patient-view';
import type { Patient, Video } from '@/lib/types';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import path from 'path';
import fs from 'fs/promises';

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


async function getPatient(patientId: string): Promise<Patient | null> {
  try {
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'patients.json');
    const patients = await readData<Patient>(jsonPath);
    const patient = patients.find(p => p.id === patientId);
    return patient || null;
  } catch (error) {
    console.error("Failed to fetch patient:", error);
    return null;
  }
}

async function getVideos(): Promise<Video[]> {
   try {
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'videos.json');
    const videos = await readData<Video>(jsonPath);
    return videos;
  } catch (error) {
    console.error("Failed to fetch videos:", error);
    return [];
  }
}


export default async function PatientDetailPage({ params }: { params: { patientId: string } }) {
  const { patientId } = params;
  const [patient, allVideos] = await Promise.all([
    getPatient(patientId),
    getVideos()
  ]);

  if (!patient) {
    notFound();
  }
  
  const assignedVideosWithDetails = (patient.assignedExercises || [])
    .map(assignment => {
      const video = allVideos?.find(v => v.id === assignment.videoId);
      if (!video) return null;
      return { ...assignment, video };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-4 h-full">
       <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Пациенты</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{patient.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PatientView patient={patient} initialAssignedExercises={assignedVideosWithDetails} allVideos={allVideos || []} />
    </div>
  );
}
