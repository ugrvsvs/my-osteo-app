'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
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
import { PlusCircle, Upload, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Video, VideoCategory } from '@/lib/types';
import { getThumbnailFromUrl } from '@/lib/video-utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function AddVideoDialog({ onVideoAdded, allCategories }: { onVideoAdded: () => void, allCategories: VideoCategory[] }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [isRutubeUrl, setIsRutubeUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailSource, setThumbnailSource] = useState<'url' | 'upload'>('url');
  const [isUploading, setIsUploading] = useState(false);

  const initialFormState: Omit<Video, 'id' | 'zone' | 'level'> & { zone?: string; level?: string; } = {
    title: '',
    description: '',
    url: '',
    thumbnailUrl: '',
    duration: '',
    categoryId: undefined,
  };
  
  const [formState, setFormState] = useState<Omit<Video, 'id' | 'zone' | 'level'> & { zone?: string; level?: string; }>(initialFormState);
  
  const resetForm = () => {
    setFormState(initialFormState);
    setIsRutubeUrl(false);
    setThumbnailSource('url');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));

    if (name === 'url') {
      setIsRutubeUrl(value.includes('rutube.ru'));
      if(value === '' && thumbnailSource === 'url') {
        setFormState(prev => ({ ...prev, thumbnailUrl: '' }));
      }
    }
  };

  const handleUrlBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (url.includes('rutube.ru')) {
      setIsRutubeUrl(true);
      return;
    }
    setIsRutubeUrl(false);
    if (url && thumbnailSource === 'url') { 
      const thumbnailUrl = await getThumbnailFromUrl(url);
      if (thumbnailUrl) {
        setFormState(prev => ({ ...prev, thumbnailUrl }));
      }
    }
  };

  const handleSelectChange = (name: 'categoryId', value: string) => {
    setFormState(prev => ({ ...prev, [name]: value === 'none' ? undefined : value }));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleThumbnailSourceChange = (value: 'url' | 'upload') => {
    setThumbnailSource(value);
    setFormState(prev => ({ ...prev, thumbnailUrl: ''}));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Не удалось загрузить файл');
        }

        setFormState(prev => ({ ...prev, thumbnailUrl: result.url }));
        toast({ title: 'Превью загружено', description: 'Ваше изображение было успешно загружено.' });
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Ошибка загрузки',
          description: error instanceof Error ? error.message : 'Произошла неизвестная ошибка.',
        });
        // Clear the file input in case of an error
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveImage = () => {
    setFormState(prev => ({ ...prev, thumbnailUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      resetForm();
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
        resetForm();
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
            {/* Form fields ... */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Название</Label>
              <Input id="title" name="title" value={formState.title} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">Описание</Label>
              <Textarea id="description" name="description" value={formState.description} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">URL Видео</Label>
              <Input id="url" name="url" value={formState.url} onChange={handleInputChange} onBlur={handleUrlBlur} className="col-span-3" required />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Превью</Label>
              <div className="col-span-3">
                <RadioGroup value={thumbnailSource} onValueChange={handleThumbnailSourceChange} className="flex items-center mb-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="url" id="r-url" /><Label htmlFor="r-url">URL</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="upload" id="r-upload" /><Label htmlFor="r-upload">Загрузить</Label></div>
                </RadioGroup>
                
                {thumbnailSource === 'url' ? (
                    <Input id="thumbnailUrl" name="thumbnailUrl" value={formState.thumbnailUrl} onChange={handleInputChange} placeholder="Автоматически для YouTube" />
                ) : (
                  <>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" disabled={isUploading} />
                    <Button type="button" variant="outline" onClick={handleUploadClick} className='w-full' disabled={isUploading}>
                      {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                      {isUploading ? 'Загрузка...' : 'Выберите файл'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {formState.thumbnailUrl && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-start-2 col-span-3 flex items-center gap-2">
                  <Image src={formState.thumbnailUrl} alt="Превью" width={128} height={72} className="rounded-md object-cover border" />
                   <Button type="button" variant="ghost" size="icon" onClick={handleRemoveImage} title="Remove image">
                      <X className="h-4 w-4" />
                    </Button>
                </div>
              </div>
            )}
            
            {isRutubeUrl && thumbnailSource === 'url' &&(
                <div className="grid grid-cols-4 items-center gap-4">
                    <div className="col-start-2 col-span-3">
                      <Alert variant="default" className="mt-2"><AlertDescription>Для Rutube необходимо указать URL превью вручную.</AlertDescription></Alert>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">Длительность</Label>
              <Input id="duration" name="duration" value={formState.duration} onChange={handleInputChange} className="col-span-3" required placeholder="например, 5:30"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryId" className="text-right">Категория</Label>
              <Select name="categoryId" value={formState.categoryId || 'none'} onValueChange={(value) => handleSelectChange('categoryId', value)}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без категории</SelectItem>
                  {allCategories?.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить видео'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
