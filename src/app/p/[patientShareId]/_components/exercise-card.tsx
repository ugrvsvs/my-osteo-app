'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import type { Patient, Video, AssignedExercise } from '@/lib/types';

type AssignedExerciseWithVideo = AssignedExercise & { video: Video };

interface ExerciseCardProps {
  patientId: string;
  exercise: AssignedExerciseWithVideo;
}

export function ExerciseCard({ patientId, exercise }: ExerciseCardProps) {
  const router = useRouter();
  const { video, order, sets, reps, duration, comments } = exercise;

  const handleClick = async () => {
    try {
      await fetch('/api/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patientId, videoId: video.id }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    } finally {
      // Navigate even if logging fails
      window.open(video.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div onClick={handleClick} className="block cursor-pointer">
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
                {(duration || video.duration) && (
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary"/> <span>Длительность: {duration || video.duration}</span></div>
                )}
                 {(sets || reps) && (
                    <div className="flex items-center gap-2">
                      <span>
                        {sets && `Подходы: ${sets}`}
                        {sets && reps && ', '}
                        {reps && `Повторения: ${reps}`}
                      </span>
                    </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Badge variant="outline">Нажмите, чтобы посмотреть видео</Badge>
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
}
