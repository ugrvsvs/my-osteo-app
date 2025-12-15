// This file is now deprecated for mock data.
// Data is seeded and fetched from Firestore.
import type { Patient, Template, Video } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find((img) => img.id === id)?.imageUrl || '';

export const mockVideos: Video[] = [];
export const mockPatients: Patient[] = [];

export const mockTemplates: Template[] = [
  {
    id: 'template1',
    name: 'Боль в пояснице (Начальный)',
    description: 'Базовый комплекс упражнений для снятия боли в пояснице.',
    exercises: [
      { videoId: 'vid1', sets: 3, reps: 15 },
      { videoId: 'vid2', sets: 3, reps: 12 },
      { videoId: 'vid4', sets: 2, reps: 10, duration: "30s" },
    ],
  },
  {
    id: 'template2',
    name: 'Разминка для плечевого пояса',
    description: 'Комплекс для улучшения подвижности плеч.',
    exercises: [
      { videoId: 'vid6', sets: 2, reps: 20 },
      { videoId: 'vid3', sets: 2, reps: 15 },
    ],
  },
];

export const mockDoctor = {
    id: 'doc1',
    name: 'Доктор',
    email: 'doctor@osteo.app'
};
