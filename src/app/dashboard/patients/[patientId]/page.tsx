import { mockPatients, mockVideos } from '@/lib/data';
import { notFound } from 'next/navigation';
import { PatientView } from './_components/patient-view';
import type { Patient } from '@/lib/types';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

// Simulate fetching data from a database
async function getPatientData(patientId: string): Promise<Patient | undefined> {
  return mockPatients.find((p) => p.id === patientId);
}

export default async function PatientDetailPage({ params }: { params: { patientId: string } }) {
  const patient = await getPatientData(params.patientId);

  if (!patient) {
    notFound();
  }
  
  const assignedVideosWithDetails = patient.assignedExercises
    .map(assignment => {
      const video = mockVideos.find(v => v.id === assignment.videoId);
      if (!video) return null;
      return { ...assignment, video };
    })
    .filter(Boolean)
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
      <PatientView patient={patient} initialAssignedExercises={assignedVideosWithDetails} allVideos={mockVideos} />
    </div>
  );
}
