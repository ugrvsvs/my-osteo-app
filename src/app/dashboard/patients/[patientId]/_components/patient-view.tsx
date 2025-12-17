'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Patient, Video, AssignedExercise, Template } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SmartGenerator } from './smart-generator';
import Image from 'next/image';
import {
  ArrowDown,
  ArrowUp,
  ClipboardList,
  Clock,
  MoreVertical,
  Plus,
  Save,
  Trash2,
  UserX,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

type AssignedExerciseWithVideo = AssignedExercise & { video: Video };

function getInitials(name: string) {
  const names = name.split(' ');
  return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
}

// Simplified Patient type for this view, without activityLog
type PatientForView = Omit<Patient, 'activityLog'>;

export function PatientView({
  patient,
  initialAssignedExercises,
}: {
  patient: PatientForView;
  initialAssignedExercises: AssignedExerciseWithVideo[];
}) {
  const [assignedExercises, setAssignedExercises] = useState(initialAssignedExercises);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState('library');

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch('/api/videos');
        if (!res.ok) throw new Error('Failed to fetch videos');
        setAllVideos(await res.json());
      } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Could not load video library.' });
      } finally {
        setIsLoadingVideos(false);
      }
    }
    fetchVideos();
  }, [toast]);

  const addExercise = (video: Video) => {
    if (assignedExercises.some(ex => ex.video_id === video.id)) {
      toast({ variant: 'destructive', title: 'Упражнение уже добавлено' });
      return;
    }
    setAssignedExercises([...assignedExercises, { patient_id: patient.id, video_id: video.id, display_order: assignedExercises.length, video }]);
  };
  
  const removeExercise = (video_id: string) => {
    setAssignedExercises(assignedExercises.filter((ex) => ex.video_id !== video_id));
  };
  
  const moveExercise = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= assignedExercises.length) return;
    const newExercises = [...assignedExercises];
    [newExercises[index], newExercises[newIndex]] = [newExercises[newIndex], newExercises[index]];
    setAssignedExercises(newExercises);
  };

  const applyTemplate = (template: Template) => {
    const exercisesFromTemplate = template.exercises.map(templateEx => {
        const video = allVideos.find(v => v.id === templateEx.id);
        return video && !assignedExercises.some(ex => ex.video_id === video.id) ? { patient_id: patient.id, video_id: video.id, video, display_order: 0 } : null;
    }).filter((ex): ex is AssignedExerciseWithVideo => ex !== null);

    if (exercisesFromTemplate.length === 0 && template.exercises.length > 0) {
        toast({ title: "Упражнения уже в плане" });
        return;
    }

    setAssignedExercises([...assignedExercises, ...exercisesFromTemplate]);
    toast({ title: 'Шаблон применен', description: `Упражнения из шаблона "${template.name}" добавлены.` })
  };

  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    if (value === 'templates' && allTemplates.length === 0) {
      setIsLoadingTemplates(true);
      try {
        const res = await fetch('/api/templates');
        if (!res.ok) throw new Error('Failed to fetch templates');
        setAllTemplates(await res.json());
      } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Could not load templates.' });
      } finally {
        setIsLoadingTemplates(false);
      }
    }
  };

  const handleSavePlan = async () => {
    setIsSaving(true);
    try {
      const exercisePlanToSave = assignedExercises.map(({ video, ...rest }, index) => ({ ...rest, video_id: video.id, display_order: index }));
      const response = await fetch(`/api/patients/${patient.id}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercises: exercisePlanToSave }),
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Не удалось сохранить план.');
      toast({ title: 'План сохранен' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка', description: error instanceof Error ? error.message : 'Произошла ошибка' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePatient = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/patients/${patient.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Не удалось удалить пациента.');
      toast({ title: 'Пациент удален' });
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка', description: error instanceof Error ? error.message : 'Произошла ошибка' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 h-full flex-1">
        <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader className="flex-row items-start gap-4 relative">
              <Avatar className="h-16 w-16 flex-shrink-0"><AvatarImage src={patient.avatarUrl} alt={patient.name} /><AvatarFallback>{getInitials(patient.name)}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl truncate">{patient.name}</CardTitle>
                <CardDescription className="truncate">{patient.email}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="absolute top-2 right-2"><MoreVertical className="h-5 w-5" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <AlertDialogTrigger asChild><DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}><UserX className="mr-2 h-4 w-4" />Удалить пациента</DropdownMenuItem></AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent><Button variant="outline" className="w-full" asChild><a href={`/p/${patient.shareId}`} target="_blank">Страница пациента</a></Button></CardContent>
          </Card>
          {/* REMOVED: Activity Summary Card is no longer here */}
        </div>

        <Card className="lg:col-span-1 xl:col-span-1 flex flex-col">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2"><ClipboardList /> План лечения</CardTitle>
              <Button size="sm" onClick={handleSavePlan} disabled={isSaving}>{isSaving ? 'Сохранение...' : <><Save className="mr-2 h-4 w-4" /> Сохранить план</>}</Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden"><ScrollArea className="h-full pr-4">
            <div className="flex flex-col gap-3">
            {assignedExercises.length === 0 ? (
              <div className="text-center text-muted-foreground py-10"><p>План пуст. Добавьте упражнения из библиотеки.</p></div>
            ) : assignedExercises.map((ex, index) => (
              <Card key={ex.video_id} className="flex items-center p-2 gap-2">
                <div className="text-sm font-bold text-muted-foreground w-6 text-center">{index + 1}.</div>
                <Image src={ex.video.thumbnailUrl} alt={ex.video.title} width={80} height={45} className="rounded-md aspect-video object-cover" />
                <div className="flex-1"><p className="font-semibold text-sm">{ex.video.title}</p></div>
                <div className="flex flex-col gap-1">
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveExercise(index, 'up')} disabled={index === 0}><ArrowUp className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveExercise(index, 'down')} disabled={index === assignedExercises.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeExercise(ex.video_id)}><Trash2 className="h-4 w-4" /></Button>
              </Card>
            ))}
            </div>
          </ScrollArea></CardContent>
        </Card>

        <Card className="lg:col-span-1 xl:col-span-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
            <div className="p-4 pb-0"><TabsList className="grid w-full grid-cols-2"><TabsTrigger value="library">Библиотека</TabsTrigger><TabsTrigger value="templates">Шаблоны</TabsTrigger></TabsList></div>
            <TabsContent value="library" className="flex-1 flex flex-col gap-4 p-4 m-0">
              <SmartGenerator onAddExercise={addExercise} />
              <ScrollArea className="flex-1 -mx-4"><div className="flex flex-col gap-2 px-4">
                {isLoadingVideos ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <div key={i} className="flex items-center gap-2"><Skeleton className="h-[34px] w-[60px] rounded"/><div className="flex-1"><Skeleton className="h-4 w-full"/><Skeleton className="h-3 w-1/4"/></div><Skeleton className="h-8 w-8 rounded-full"/></div>)}
                  </div>
                ) : allVideos.length > 0 ? allVideos.map(video => (
                  <div key={video.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                    <Image src={video.thumbnailUrl} alt={video.title} width={60} height={34} className="rounded aspect-video object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs truncate">{video.title}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {video.duration}</div>
                    </div>
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => addExercise(video)}><Plus className="h-4 w-4"/></Button>
                  </div>
                )) : <p className="text-muted-foreground text-sm text-center py-4">Библиотека пуста.</p>}
              </div></ScrollArea>
            </TabsContent>
            <TabsContent value="templates" className="flex-1"><ScrollArea className="h-full">
              <div className="flex flex-col gap-2 p-4 pt-0">
                {isLoadingTemplates ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <div key={i} className="p-3"><Skeleton className="h-5 w-3/5 mb-2"/><Skeleton className="h-4 w-4/5 mb-3"/><Skeleton className="h-9 w-full"/></div>)}
                  </div>
                ) : allTemplates.length === 0 ? (
                  <p className="text-muted-foreground text-sm p-4 text-center">Шаблоны не найдены.</p>
                ) : allTemplates.map(template => (
                  <Card key={template.id} className="p-3">
                    <p className="font-semibold">{template.name}</p>
                    <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => applyTemplate(template)}>Применить шаблон</Button>
                  </Card>
                ))}
              </div>
            </ScrollArea></TabsContent>
          </Tabs>
        </Card>

        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Вы уверены?</AlertDialogTitle><AlertDialogDescription>Это действие необратимо. Профиль пациента будет удален навсегда.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePatient} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">{isDeleting ? 'Удаление...' : 'Да, удалить'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </div>
    </AlertDialog>
  );
}
