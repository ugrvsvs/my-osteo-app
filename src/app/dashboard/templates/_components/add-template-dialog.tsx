'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import type { Video, Template } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AddTemplateDialog({ onTemplateAdded }: { onTemplateAdded: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Video[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { data: allVideos, error: videosError } = useSWR<Video[]>('/api/videos', fetcher);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setSelectedExercises([]);
    }
  }, [isOpen]);

  const addExercise = (video: Video) => {
    if (!selectedExercises.some((e) => e.id === video.id)) {
      setSelectedExercises([...selectedExercises, video]);
    }
  };

  const removeExercise = (videoId: string) => {
    setSelectedExercises(selectedExercises.filter((e) => e.id !== videoId));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ variant: 'destructive', title: 'Название обязательно' });
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          exercises: selectedExercises,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось создать шаблон');
      }

      toast({
        title: 'Шаблон создан',
        description: `Шаблон "${name}" успешно создан.`,
      });
      
      onTemplateAdded();
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Произошла неизвестная ошибка.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Новый шаблон
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl grid-rows-[auto_1fr_auto] h-[80vh]">
        <DialogHeader>
          <DialogTitle>Создать новый шаблон</DialogTitle>
          <DialogDescription>
            Создайте шаблон для быстрого назначения набора упражнений пациентам.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2">
            <div>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">Название</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="description">Описание</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                </div>

                <div className="mt-4">
                    <h3 className="font-semibold mb-2">Выбранные упражнения ({selectedExercises.length})</h3>
                    <ScrollArea className="h-64 pr-4">
                    <div className="space-y-2">
                        {selectedExercises.length > 0 ? selectedExercises.map((ex) => (
                        <div key={ex.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                            <p className="flex-1 font-medium text-sm">{ex.title}</p>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeExercise(ex.id)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                        </div>
                        )) : <p className="text-sm text-muted-foreground text-center py-4">Нет выбранных упражнений</p>}
                    </div>
                    </ScrollArea>
                </div>
            </div>
            <div>
                <h3 className="font-semibold mb-2">Библиотека упражнений</h3>
                <ScrollArea className="h-[50vh] pr-4">
                    <div className="space-y-2">
                        {videosError ? <p>Не удалось загрузить видео.</p> : !allVideos ? <p>Загрузка...</p> : allVideos.map((video) => (
                            <div key={video.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                                <Image src={video.thumbnailUrl} alt={video.title} width={60} height={34} className="rounded aspect-video object-cover" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-xs truncate">{video.title}</p>
                                </div>
                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => addExercise(video)} disabled={selectedExercises.some(e => e.id === video.id)}>
                                    <Plus className="h-4 w-4"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSaving}>Отмена</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Сохранение...' : 'Сохранить шаблон'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
