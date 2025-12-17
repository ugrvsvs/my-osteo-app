
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/app/logo';
import type { Patient, Video, AssignedExercise } from '@/lib/types';
import { ExerciseCard } from './_components/exercise-card';

// Define the shape of the data that this page will receive
type AssignedExerciseWithVideo = AssignedExercise & { video: Video };
type PatientPlan = Omit<Patient, 'assignedExercises'> & {
  assignedExercises: AssignedExerciseWithVideo[];
};

// This function fetches the patient data from our own API
async function getPatientPlan(patientShareId: string): Promise<PatientPlan | null> {
  try {
    // Use the correct internal address, including the correct port from server logs.
    const baseUrl = 'http://localhost:9002';
    const res = await fetch(`${baseUrl}/api/share/${patientShareId}`);

    if (!res.ok) {
      // If the API returns 404 or any other error, we treat it as not found.
      return null;
    }

    const data = await res.json();
    return data;

  } catch (error) {
    console.error(`[PatientSharePage] Failed to fetch patient plan:`, error);
    // In case of a network error or other exception, we also treat it as not found.
    return null;
  }
}

// The main component for the patient-facing page
export default async function PatientSharePage({ params }: { params: { patientShareId: string } }) {
  const patient = await getPatientPlan(params.patientShareId);

  // If no patient is found, trigger a 404 Not Found page.
  if (!patient) {
    notFound();
  }

  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="py-4 px-6 border-b">
        <Logo />
      </header>
      <main className="container mx-auto max-w-4xl py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-20 w-20">
            <AvatarImage src={patient.avatarUrl} alt={patient.name} />
            <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-muted-foreground">План лечения для</p>
            <h1 className="text-3xl font-bold">{patient.name}</h1>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Ваши упражнения</h2>
          {patient.assignedExercises && patient.assignedExercises.length > 0 ? (
            patient.assignedExercises.map((exercise) => (
              <ExerciseCard key={exercise.order} patientId={patient.id} exercise={exercise} />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>Вам еще не назначили упражнений.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <footer className="text-center py-6 text-muted-foreground text-sm border-t">
        <p>&copy; {new Date().getFullYear()} Мой Остео. Все права защищены.</p>
      </footer>
    </div>
  );
}
