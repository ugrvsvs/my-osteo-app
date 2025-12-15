// This page will need to be refactored to fetch data from the new API
// For now, it will use mock data to avoid breaking.
import { mockPatients, mockVideos } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Clock, Layers, Repeat } from 'lucide-react';
import { Logo } from '@/components/app/logo';

export default function PatientSharePage({ params }: { params: { patientShareId: string } }) {
  // TODO: Replace with API call
  const patient = mockPatients.find((p) => p.shareId === params.patientShareId);

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

  // TODO: Replace with API call or pass data from parent
  const assignedVideos = patient.assignedExercises
    .map(ex => ({ ...ex, video: mockVideos.find(v => v.id === ex.videoId) }))
    .filter(ex => ex.video)
    .sort((a,b) => a.order - b.order);

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
            assignedVideos.map(({ video, order, sets, reps, duration, comments }) => video && (
              <a href={video.url} target="_blank" rel="noopener noreferrer" key={order} className="block">
                <Card className="overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 relative aspect-video md:aspect-auto">
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="md:w-2/3 flex flex-col">
                      <CardHeader>
                        <Badge variant="secondary" className="w-fit mb-2">Упражнение #{order}</Badge>
                        <CardTitle>{video.title}</CardTitle>
                        <CardDescription>{video.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        {comments && (
                            <div className="mb-4 p-3 bg-accent/30 text-accent-foreground/80 rounded-md text-sm border border-dashed border-accent">
                                <strong>Комментарий врача:</strong> {comments}
                            </div>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2"><Layers className="h-4 w-4 text-primary"/> <span>Подходы: {sets}</span></div>
                            <div className="flex items-center gap-2"><Repeat className="h-4 w-4 text-primary"/> <span>Повторения: {reps}</span></div>
                            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary"/> <span>Длительность: {duration || video.duration}</span></div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Badge variant="outline">Нажмите, чтобы посмотреть видео</Badge>
                      </CardFooter>
                    </div>
                  </div>
                </Card>
              </a>
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
