'use client';
import { notFound } from 'next/navigation';
import { PatientView } from './_components/patient-view';
import type { Patient, Video } from '@/lib/types';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';

export default function PatientDetailPage({ params }: { params: { patientId: string } }) {
  const firestore = useFirestore();

  const patientRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'patients', params.patientId);
  }, [firestore, params.patientId]);

  const allVideosRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'videos');
  }, [firestore]);

  const { data: patient, isLoading: isPatientLoading } = useDoc<Patient>(patientRef);
  const { data: allVideos, isLoading: areVideosLoading } = useCollection<Video>(allVideosRef);

  if (isPatientLoading || areVideosLoading) {
    return <p>Загрузка данных пациента...</p>;
  }

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
