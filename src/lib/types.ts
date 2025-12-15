export type Video = {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  duration: string; // e.g., "5:30"
  zone: 'spine' | 'knee' | 'shoulder' | 'foot' | 'hand' | 'general' | string;
  level: 'beginner' | 'intermediate' | 'advanced' | string;
  limitations?: string;
  categoryId?: string;
};

export type VideoCategory = {
  id: string;
  name: string;
};

export type AssignedExercise = {
  videoId: string;
  order: number;
  sets: number;
  reps: number;
  duration?: string; // e.g. "30s"
  comments?: string;
};

export type ActivityLog = {
  id: string;
  videoId: string;
  timestamp: string; // ISO 8601 date string
  action: 'opened' | 'completed';
};

export type Patient = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  shareId: string;
  assignedExercises: AssignedExercise[];
  activityLog: ActivityLog[];
  lastActivity?: string; // ISO 8601 date string
};

export type Template = {
  id: string;
  name: string;
  description: string;
  exercises: Pick<AssignedExercise, 'videoId'>[];
};
