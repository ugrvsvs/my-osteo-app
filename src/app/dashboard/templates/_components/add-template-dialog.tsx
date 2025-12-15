'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useSWR from 'swr';
import type { Video, AssignedExercise } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type TemplateExercise = Pick<AssignedExercise, 'videoId'>;

export function AddTemplateDialog({ onTemplateAdded }: { onTemplateAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { data: allVideos } = useSWR<Video[]>('/api/videos', fetcher);

  const initialFormState = {
    name: '',
    description: '',
    exercises: [] as TemplateExercise[],
  };
  const [formState, setFormState] = useState(initialFormState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };
  
  const addExerciseField = () => {
    if (!allVideos || allVideos.length === 0) return;
    setFormState(prev => ({
      ...prev,
      exercises: [...prev.exercises, { videoId: allVideos[0].id }]
    }));
  };

  const removeExerciseField = (index: number) => {
    setFormState(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const handleExerciseChange = (index: number, field: keyof TemplateExercise, value: string) => {
    const newExercises = [...formState.exercises];
    const exercise = newExercises[index];
    if (exercise) {
      (exercise[field] as any) = value;
      setFormState(prev => ({ ...prev, exercises: newExercises }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.exercises.length === 0) {
        toast({
            variant: 'destructive',
            title: 'Ошибка',
            description: 'Шаблон должен содержать хотя бы одно упражнение.',
        });
        return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        throw new Error('Не удалось создать шаблон');
      }

      toast({
        title: 'Шаблон создан',
        description: `Шаблон "${formState.name}" был успешно создан.`,
      });
      onTemplateAdded();
      setOpen(false);
      setFormState(initialFormState);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Произошла неизвестная ошибка.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            setFormState(initialFormState);
        }
    }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle />
          Добавить шаблон
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Новый шаблон</DialogTitle>
            <DialogDescription>Создайте новый шаблон для быстрого назначения упражнений.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label htmlFor="name">Название шаблона</Label>
              <Input id="name" name="name" value={formState.name} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea id="description" name="description" value={formState.description} onChange={handleInputChange} />
            </div>
            
            <div className="space-y-4">
                <Label>Упражнения</Label>
                {formState.exercises.map((ex, index) => (
                    <div key={index} className="flex items-end gap-2 p-3 border rounded-md">
                        <div className="grid gap-2 flex-1">
                            <Label htmlFor={`video-${index}`} className="text-xs">Видео</Label>
                             <Select
                                value={ex.videoId}
                                onValueChange={(value) => handleExerciseChange(index, 'videoId', value)}
                            >
                                <SelectTrigger id={`video-${index}`}>
                                <SelectValue placeholder="Выберите видео" />
                                </SelectTrigger>
                                <SelectContent>
                                {allVideos?.map(video => (
                                    <SelectItem key={video.id} value={video.id}>{video.title}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="button" size="icon" variant="ghost" className="text-destructive" onClick={() => removeExerciseField(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={addExerciseField}>Добавить упражнение</Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить шаблон'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
