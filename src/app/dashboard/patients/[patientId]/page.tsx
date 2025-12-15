'use client';
import { notFound } from 'next/navigation';
import { PatientView } from './_components/patient-view';
import type { Patient, Video } from '@/lib/types';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function PatientDetailPage({ params }: { params: { patientId: string } }) {
  const { data: patient, error: patientError, isLoading: isPatientLoading } = useSWR<Patient>(params.patientId ? `/api/patients/${params.patientId}` : null, fetcher);
  const { data: allVideos, error: videosError, isLoading: areVideosLoading } = useSWR<Video[]>('/api/videos', fetcher);

  if (isPatientLoading || areVideosLoading) {
    return <p>Загрузка данных пациента...</p>;
  }

  if (patientError || !patient) {
    // This will trigger the not-found page if the API returns an error (e.g., 404)
    notFound();
  }

  if (videosError) {
    return <p className='text-destructive'>Не удалось загрузить видео.</p>
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
