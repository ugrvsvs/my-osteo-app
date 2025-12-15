import { notFound } from 'next/navigation';
import { PatientView } from './_components/patient-view';
import type { Patient, Video } from '@/lib/types';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

// This is now a Server Component to correctly handle params

async function getPatient(patientId: string): Promise<Patient | null> {
  // In a real app, fetch from your database
  // For this demo, we'll simulate a fetch.
  try {
    const res = await fetch(`http://localhost:9002/api/patients/${patientId}`, { cache: 'no-store' });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("Failed to fetch patient:", error);
    return null;
  }
}

async function getVideos(): Promise<Video[]> {
   try {
    const res = await fetch('http://localhost:9002/api/videos', { cache: 'no-store' });
    if (!res.ok) {
      return [];
    }
    return res.json();
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
