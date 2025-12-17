
import { notFound } from 'next/navigation';
import { PatientView } from './_components/patient-view';
import type { Patient, Video, AssignedExercise } from '@/lib/types';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { headers } from 'next/headers';

// Optimized data fetching function for the page
async function getPatientData(patientId: string, cookie: string | null): Promise<{
  patient: (Patient & { assignedExercises: (AssignedExercise & { video: Video })[] }) | null;
}> {
  const fetchOptions = { headers: { 'Cookie': cookie || '' } };
  // CORRECTED: Use the correct internal address from server logs
  const baseUrl = 'http://localhost:9002';

  try {
    // Fetch only the essential patient data for the initial load
    const patientRes = await fetch(`${baseUrl}/api/patients/${patientId}`, fetchOptions);

    if (!patientRes.ok) {
      if (patientRes.status === 404) return { patient: null };
      const errorText = await patientRes.text();
      console.error(`Failed to fetch patient. Status: ${patientRes.status}`, errorText);
      throw new Error(`Failed to fetch patient. Status: ${patientRes.status}`);
    }
    
    const patient = await patientRes.json();

    // The API for a single patient already returns the exercises in the correct shape.
    // We just need to ensure they are sorted.
    const assignedExercisesWithVideo = (patient.assignedExercises || []).sort((a: any, b: any) => a.order - b.order);
    
    const fullPatientData = {
        ...patient,
        assignedExercises: assignedExercisesWithVideo
    }

    return { patient: fullPatientData };

  } catch (error) {
    console.error("Failed to fetch page data:", error);
    return { patient: null };
  }
}

export default async function PatientDetailPage({ params }: { params: { patientId: string } }) {
  const headersList = headers();
  const cookie = headersList.get('cookie');
    
  const { patientId } = params;
  // Fetch only the essential patient data
  const { patient } = await getPatientData(patientId, cookie);

  if (!patient) {
    notFound();
  }

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
      <PatientView 
        patient={patient} 
        initialAssignedExercises={patient.assignedExercises}
        // allVideos and allTemplates are no longer passed down, they will be fetched on demand
      />
    </div>
  );
}
