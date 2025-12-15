import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/app/logo';
import type { Patient, Video, AssignedExercise } from '@/lib/types';
import { ExerciseCard } from './_components/exercise-card';


type AssignedExerciseWithVideo = AssignedExercise & { video: Video };

type PatientWithExercises = Omit<Patient, 'assignedExercises'> & {
  assignedExercises: AssignedExerciseWithVideo[];
};


async function getPatientPlan(patientShareId: string): Promise<PatientWithExercises | null> {
    try {
        const res = await fetch(`http://localhost:9002/api/share/${patientShareId}`, { cache: 'no-store' });
        if (!res.ok) {
            return null;
        }
        return res.json();
    } catch (error) {
        console.error("Failed to fetch patient plan:", error);
        return null;
    }
}


export default async function PatientSharePage({ params }: { params: { patientShareId: string } }) {
  const patient = await getPatientPlan(params.patientShareId);

  if (!patient) {
    notFound();
  }

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return names[0].substring(0, 2);
  };

  const assignedVideos = patient.assignedExercises.sort((a,b) => a.order - b.order);

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
          {assignedVideos.length === 0 ? (
            <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    <p>Вам еще не назначили упражнений.</p>
                </CardContent>
            </Card>
          ) : (
            assignedVideos.map((exercise) => (
              <ExerciseCard key={exercise.order} patientId={patient.id} exercise={exercise} />
            ))
          )}
        </div>
      </main>
      <footer className="text-center py-6 text-muted-foreground text-sm border-t">
        <p>&copy; {new Date().getFullYear()} Мой Остео. Все права защищены.</p>
      </footer>
    </div>
  );
}
