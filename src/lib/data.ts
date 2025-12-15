import type { Patient, Template, Video } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find((img) => img.id === id)?.imageUrl || '';

export const mockVideos: Video[] = [
  {
    id: 'vid1',
    title: 'Наклоны таза',
    description: 'Упражнение для укрепления мышц кора и снятия напряжения в пояснице.',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: findImage('video-1'),
    duration: '3:45',
    zone: 'spine',
    level: 'beginner',
  },
  {
    id: 'vid2',
    title: 'Мостик',
    description: 'Укрепляет ягодичные мышцы и заднюю поверхность бедра, стабилизирует таз.',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: findImage('video-2'),
    duration: '5:10',
    zone: 'spine',
    level: 'beginner',
  },
  {
    id: 'vid3',
    title: 'Кошка-Корова',
    description: 'Улучшает гибкость позвоночника и снимает напряжение в спине.',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: findImage('video-3'),
    duration: '4:20',
    zone: 'spine',
    level: 'intermediate',
  },
  {
    id: 'vid4',
    title: 'Сгибание колена к груди',
    description: 'Растягивает мышцы нижней части спины и ягодиц.',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: findImage('video-4'),
    duration: '6:00',
    zone: 'knee',
    level: 'beginner',
  },
  {
    id: 'vid5',
    title: 'Подъемы на носки',
    description: 'Укрепляет икроножные мышцы и улучшает стабильность голеностопа.',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: findImage('video-5'),
    duration: '2:30',
    zone: 'foot',
    level: 'beginner',
  },
  {
    id: 'vid6',
    title: 'Махи руками',
    description: 'Развивает подвижность плечевых суставов и снимает напряжение в шее.',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: findImage('video-6'),
    duration: '3:00',
    zone: 'shoulder',
    level: 'intermediate',
  },
];

export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Анна Ковалева',
    email: 'anna.kovaleva@example.com',
    avatarUrl: findImage('patient-1'),
    shareId: 'share-anna-123',
    lastActivity: '2024-07-20T10:00:00Z',
    assignedExercises: [
      { videoId: 'vid1', order: 1, sets: 3, reps: 15 },
      { videoId: 'vid2', order: 2, sets: 3, reps: 12 },
    ],
    activityLog: [
      { id: 'log1', videoId: 'vid1', timestamp: '2024-07-20T10:05:00Z', action: 'opened' },
      { id: 'log2', videoId: 'vid1', timestamp: '2024-07-20T10:10:00Z', action: 'completed' },
    ],
  },
  {
    id: '2',
    name: 'Иван Петров',
    email: 'ivan.petrov@example.com',
    avatarUrl: findImage('patient-2'),
    shareId: 'share-ivan-456',
    lastActivity: '2024-07-19T15:30:00Z',
    assignedExercises: [
        { videoId: 'vid3', order: 1, sets: 3, reps: 10, comments: 'Делать медленно, следить за дыханием.' },
        { videoId: 'vid6', order: 2, sets: 2, reps: 20 },
    ],
    activityLog: [
      { id: 'log3', videoId: 'vid3', timestamp: '2024-07-19T15:35:00Z', action: 'opened' },
    ],
  },
  {
    id: '3',
    name: 'Ольга Сидорова',
    email: 'olga.sidorova@example.com',
    avatarUrl: findImage('patient-3'),
    shareId: 'share-olga-789',
    assignedExercises: [],
    activityLog: [],
  },
    {
    id: '4',
    name: 'Дмитрий Васильев',
    email: 'dmitry.vasiliev@example.com',
    avatarUrl: findImage('patient-4'),
    shareId: 'share-dmitry-012',
    lastActivity: '2024-07-18T09:00:00Z',
    assignedExercises: [
        { videoId: 'vid4', order: 1, sets: 2, reps: 15, duration: "30s" },
        { videoId: 'vid5', order: 2, sets: 3, reps: 20 },
    ],
    activityLog: [],
  },
];

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
      { videoЯ: 'vid3', sets: 2, reps: 15 },
    ],
  },
];

export const mockDoctor = {
    id: 'doc1',
    name: 'Доктор',
    email: 'doctor@osteo.app'
};
