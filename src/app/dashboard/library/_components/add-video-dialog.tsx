
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Video, VideoCategory } from '@/lib/types';
import { getThumbnailFromUrl } from '@/lib/video-utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AddVideoDialog({ onVideoAdded, allCategories }: { onVideoAdded: () => void, allCategories: VideoCategory[] }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [isRutubeUrl, setIsRutubeUrl] = useState(false);
  
  const initialFormState: Omit<Video, 'id'> = {
    title: '',
    description: '',
    url: '',
    thumbnailUrl: '',
    duration: '',
    zone: 'general',
    level: 'beginner',
    categoryId: undefined,
  };
  
  const [formState, setFormState] = useState<Omit<Video, 'id'>>(initialFormState);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));

    if (name === 'url') {
      setIsRutubeUrl(value.includes('rutube.ru'));
    }
  };

  const handleUrlBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (url.includes('rutube.ru')) {
      setIsRutubeUrl(true);
      return;
    }
    setIsRutubeUrl(false);
    if (url && !formState.thumbnailUrl) { // Only fetch if thumbnail is not already set
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
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось добавить видео');
      }

      toast({
        title: 'Видео добавлено',
        description: `Видео "${formState.title}" было успешно добавлено в библиотеку.`,
      });
      onVideoAdded();
      setOpen(false);
      setFormState(initialFormState);
      setIsRutubeUrl(false);
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
        setIsRutubeUrl(false);
      }
    }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle />
          Добавить видео
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Добавить новое видео</DialogTitle>
            <DialogDescription>
              Заполните информацию о новом видео-упражнении.
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
              <div className="col-span-3 flex items-center gap-2">
                <Input id="thumbnailUrl" name="thumbnailUrl" value={formState.thumbnailUrl} onChange={handleInputChange} className="flex-1" placeholder="Заполнится для YouTube" />
              </div>
            </div>
            {isRutubeUrl && (
              <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-start-2 col-span-3">
                    <Alert variant="default" className="mt-2">
                      <AlertDescription>
                        Для Rutube необходимо указать URL превью вручную.
                      </AlertDescription>
                    </Alert>
                  </div>
              </div>
            )}
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
              {isSubmitting ? 'Сохранение...' : 'Сохранить видео'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
