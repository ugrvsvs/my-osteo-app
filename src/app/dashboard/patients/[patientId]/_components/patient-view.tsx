'use client';

import { useState } from 'react';
import type { Patient, Video, AssignedExercise, Template } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SmartGenerator } from './smart-generator';
import Image from 'next/image';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ClipboardList,
  Clock,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

type AssignedExerciseWithVideo = AssignedExercise & { video: Video };

function getInitials(name: string) {
  const names = name.split(' ');
  return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
}

function getActivitySummary(activityLog: Patient['activityLog'], allVideos: Video[]) {
    if (!activityLog || activityLog.length === 0) {
        return [];
    }

    const summary = new Map<string, { count: number; video: Video | undefined }>();

    for (const log of activityLog) {
        if (log.action === 'opened') {
            const current = summary.get(log.videoId);
            if (current) {
                summary.set(log.videoId, { ...current, count: current.count + 1 });
            } else {
                const video = allVideos.find(v => v.id === log.videoId);
                summary.set(log.videoId, { count: 1, video });
            }
        }
    }

    return Array.from(summary.entries()).map(([videoId, data]) => ({
        videoId,
        count: data.count,
        video: data.video,
    }));
}


export function PatientView({
  patient,
  initialAssignedExercises,
  allVideos,
  allTemplates,
}: {
  patient: Patient;
  initialAssignedExercises: AssignedExerciseWithVideo[];
  allVideos: Video[];
  allTemplates: Template[];
}) {
  const [assignedExercises, setAssignedExercises] = useState(initialAssignedExercises);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const activitySummary = getActivitySummary(patient.activityLog, allVideos);

  const addExercise = (video: Video) => {
    // Check if the exercise is already in the plan
    if (assignedExercises.some(ex => ex.videoId === video.id)) {
      toast({
        variant: 'destructive',
        title: 'Упражнение уже добавлено',
        description: 'Это упражнение уже есть в плане лечения.',
      });
      return;
    }
    const newExercise: AssignedExerciseWithVideo = {
      videoId: video.id,
      order: assignedExercises.length + 1,
      sets: 3,
      reps: 12,
      video,
    };
    setAssignedExercises([...assignedExercises, newExercise]);
  };
  
  const removeExercise = (order: number) => {
    setAssignedExercises(
      assignedExercises
        .filter((ex) => ex.order !== order)
        .map((ex, index) => ({ ...ex, order: index + 1 }))
    );
  };
  
  const moveExercise = (order: number, direction: 'up' | 'down') => {
    const index = assignedExercises.findIndex(ex => ex.order === order);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= assignedExercises.length) return;
    
    const newExercises = [...assignedExercises];
    const temp = newExercises[index];
    newExercises[index] = newExercises[newIndex];
    newExercises[newIndex] = temp;

    setAssignedExercises(newExercises.map((ex, idx) => ({ ...ex, order: idx + 1 })));
  };

  const applyTemplate = (template: Template) => {
    const exercisesFromTemplate: AssignedExerciseWithVideo[] = template.exercises
      .map((templateEx) => {
        const video = allVideos.find(v => v.id === templateEx.videoId);
        if (!video) return null;
        // Avoid adding duplicates
        if (assignedExercises.some(assignedEx => assignedEx.videoId === video.id)) {
            return null;
        }
        return {
          ...templateEx,
          video,
          order: 0, // temporary order
        };
      })
      .filter((ex): ex is AssignedExerciseWithVideo => ex !== null);

    if (exercisesFromTemplate.length === 0 && template.exercises.length > 0) {
        toast({
            title: "Упражнения уже в плане",
            description: "Все упражнения из этого шаблона уже есть в плане лечения."
        });
        return;
    }

    const newCombinedExercises = [...assignedExercises, ...exercisesFromTemplate]
        .map((ex, index) => ({...ex, order: index + 1 }));

    setAssignedExercises(newCombinedExercises);
    toast({
        title: 'Шаблон применен',
        description: `Упражнения из шаблона "${template.name}" добавлены в план.`
    })
  };

  const handleSavePlan = async () => {
    setIsSaving(true);
    try {
      const exercisePlanToSave = assignedExercises.map(({ video, ...rest }) => rest);
      
      const response = await fetch(`/api/patients/${patient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedExercises: exercisePlanToSave }),
      });

      if (!response.ok) {
        throw new Error('Не удалось сохранить план.');
      }

      toast({
        title: 'План сохранен',
        description: `План лечения для ${patient.name} был успешно обновлен.`,
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Произошла ошибка при сохранении.',
      });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-full flex-1">
      {/* Left Column */}
      <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-6">
        <Card>
          <CardHeader className="flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={patient.avatarUrl} alt={patient.name} />
              <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{patient.name}</CardTitle>
              <CardDescription>{patient.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
                <a href={`/p/${patient.shareId}`} target="_blank" rel="noopener noreferrer">Страница пациента</a>
            </Button>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity /> Сводка Активности
            </CardTitle>
            <CardDescription>Статистика по открытым упражнениям.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ScrollArea className="h-48">
              <div className="flex flex-col gap-3 pr-3">
                {activitySummary.length > 0 ? (
                  activitySummary.map(item => (
                      item.video && (
                      <div key={item.videoId} className="flex items-center gap-3 text-sm">
                        <Image src={item.video.thumbnailUrl} alt={item.video.title} width={60} height={34} className="rounded aspect-video object-cover"/>
                        <div className="flex-1">
                          <p className="font-medium truncate">{item.video.title}</p>
                        </div>
                        <div className="font-semibold text-base">{item.count}</div>
                      </div>
                      )
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Нет зарегистрированной активности.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Middle Column */}
      <Card className="lg:col-span-1 xl:col-span-2 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList /> План лечения
            </CardTitle>
            <Button size="sm" onClick={handleSavePlan} disabled={isSaving}>
                {isSaving ? 'Сохранение...' : <><Save /> Сохранить план</>}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-3 pr-4">
            {assignedExercises.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                  <p>План лечения пуст.</p>
                  <p>Добавьте упражнения из библиотеки справа.</p>
                </div>
            ) : assignedExercises.map((ex) => (
              <Card key={ex.order} className="flex items-center p-2 gap-2">
                <div className="text-sm font-bold text-muted-foreground w-6 text-center">{ex.order}.</div>
                <Image src={ex.video.thumbnailUrl} alt={ex.video.title} width={80} height={45} className="rounded-md aspect-video object-cover" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{ex.video.title}</p>
                  <p className="text-xs text-muted-foreground">{`Подходы: ${ex.sets}, Повторения: ${ex.reps}`}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveExercise(ex.order, 'up')} disabled={ex.order === 1}><ArrowUp className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveExercise(ex.order, 'down')} disabled={ex.order === assignedExercises.length}><ArrowDown className="h-4 w-4" /></Button>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeExercise(ex.order)}><Trash2 className="h-4 w-4" /></Button>
              </Card>
            ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right Column */}
      <Card className="lg:col-span-1 xl:col-span-1 flex flex-col">
        <Tabs defaultValue="library" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
            <TabsTrigger value="library">Библиотека</TabsTrigger>
            <TabsTrigger value="templates">Шаблоны</TabsTrigger>
          </TabsList>
          <TabsContent value="library" className="flex-1 flex flex-col gap-4 p-4 m-0">
            <SmartGenerator onAddExercise={addExercise} />
             <ScrollArea className="flex-1 -mx-4">
                <div className="flex flex-col gap-2 px-4">
                  {allVideos.map(video => (
                    <div key={video.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                        <Image src={video.thumbnailUrl} alt={video.title} width={60} height={34} className="rounded aspect-video object-cover" />
                        <div className="flex-1">
                            <p className="font-semibold text-xs">{video.title}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {video.duration}</div>
                        </div>
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => addExercise(video)}><Plus className="h-4 w-4"/></Button>
                    </div>
                  ))}
                </div>
             </ScrollArea>
          </TabsContent>
          <TabsContent value="templates" className="flex-1">
             <ScrollArea className="h-full">
                <div className="flex flex-col gap-2 p-4 pt-0">
                  {allTemplates.length === 0 ? (
                     <p className="text-muted-foreground text-sm p-4 text-center">Шаблоны не найдены.</p>
                  ) : allTemplates.map(template => (
                    <Card key={template.id} className="p-3">
                      <p className="font-semibold">{template.name}</p>
                      <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                      <Button size="sm" variant="outline" className="w-full" onClick={() => applyTemplate(template)}>Применить шаблон</Button>
                    </Card>
                  ))}
                </div>
             </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
