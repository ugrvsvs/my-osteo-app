
'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Video, VideoCategory } from '@/lib/types';
import { getThumbnailFromUrl } from '@/lib/video-utils';

interface EditVideoDialogProps {
  video: Video;
  onVideoUpdated: () => void;
  allCategories: VideoCategory[];
  children: React.ReactNode;
}

export function EditVideoDialog({ video, onVideoUpdated, allCategories, children }: EditVideoDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const [formState, setFormState] = useState(video);

  useEffect(() => {
    // Update state if the video prop changes
    setFormState(video);
  }, [video]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleUrlBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (url) {
      const thumbnailUrl = await getThumbnailFromUrl(url);
      if (thumbnailUrl) {
        setFormState(prev => ({ ...prev, thumbnailUrl }));
      }
    }
  };

  const handleSelectChange = (name: 'zone' | 'level' | 'categoryId', value: string) => {
    setFormState(prev => ({ ...prev, [name]: value === 'none' ? undefined : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/videos/${video.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось обновить видео');
      }

      toast({
        title: 'Видео обновлено',
        description: `Видео "${formState.title}" было успешно обновлено.`,
      });
      onVideoUpdated();
      setOpen(false);
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
  
  useEffect(() => {
    if (open) {
      setFormState(video);
    }
  }, [open, video]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Редактировать видео</DialogTitle>
            <DialogDescription>
              Измените информацию о видео-упражнении.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Название
              </Label>
              <Input id="title" name="title" value={formState.title} onChange={handleInputChange} className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Описание
              </Label>
              <Textarea id="description" name="description" value={formState.description} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL Видео
              </Label>
              <Input id="url" name="url" value={formState.url} onChange={handleInputChange} onBlur={handleUrlBlur} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="thumbnailUrl" className="text-right">
                URL Превью
              </Label>
              <Input id="thumbnailUrl" name="thumbnailUrl" value={formState.thumbnailUrl} onChange={handleInputChange} className="col-span-3" placeholder="Заполнится автоматически" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Длительность
              </Label>
              <Input id="duration" name="duration" value={formState.duration} onChange={handleInputChange} className="col-span-3" required placeholder="например, 5:30"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryId" className="text-right">
                Категория
              </Label>
              <Select name="categoryId" value={formState.categoryId || 'none'} onValueChange={(value) => handleSelectChange('categoryId', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без категории</SelectItem>
                  {allCategories?.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="zone" className="text-right">
                Зона
              </Label>
              <Select name="zone" value={formState.zone} onValueChange={(value) => handleSelectChange('zone', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Выберите зону тела" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Общее</SelectItem>
                  <SelectItem value="spine">Позвоночник</SelectItem>
                  <SelectItem value="knee">Колено</SelectItem>
                  <SelectItem value="shoulder">Плечо</SelectItem>
                  <SelectItem value="foot">Стопа</SelectItem>
                  <SelectItem value="hand">Кисть</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="level" className="text-right">
                Уровень
              </Label>
               <Select name="level" value={formState.level} onValueChange={(value) => handleSelectChange('level', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Выберите уровень сложности" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Новичок</SelectItem>
                  <SelectItem value="intermediate">Средний</SelectItem>
                  <SelectItem value="advanced">Продвинутый</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
