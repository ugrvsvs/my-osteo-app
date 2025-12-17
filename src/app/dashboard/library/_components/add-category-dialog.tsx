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
import { PlusCircle, Trash2, Edit, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useSWR from 'swr';
import type { VideoCategory } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function CategoryItem({ 
    category, 
    onUpdate, 
    onDelete 
}: { 
    category: VideoCategory, 
    onUpdate: (id: string, name: string) => Promise<void>,
    onDelete: (id: string) => Promise<void>
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(category.name);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleUpdate = async () => {
        if (name.trim() === '' || name === category.name) {
            setIsEditing(false);
            return;
        }
        setIsProcessing(true);
        await onUpdate(category.id, name);
        setIsProcessing(false);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        setIsProcessing(true);
        await onDelete(category.id);
        // No need to set processing to false as component will be unmounted
    };

    const handleCancel = () => {
        setName(category.name);
        setIsEditing(false);
    };

    return (
        <div className="flex items-center justify-between p-2 rounded-md border bg-muted/20 gap-2">
            {isEditing ? (
                <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-8"
                    disabled={isProcessing}
                />
            ) : (
                <span className="flex-1 truncate">{category.name}</span>
            )}
            <div className="flex items-center gap-1">
                {isEditing ? (
                    <>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={handleUpdate} disabled={isProcessing}>
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancel} disabled={isProcessing}>
                            <X className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete} disabled={isProcessing}>
                           {isProcessing ? <div className="h-4 w-4 border-2 border-border border-t-destructive rounded-full animate-spin"/> : <Trash2 className="h-4 w-4" />} 
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

export function AddCategoryDialog({ onCategoryAdded }: { onCategoryAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const { toast } = useToast();
  
  const { data: categoriesData, error, isLoading, mutate } = useSWR<{ categories: VideoCategory[] }>(
    open ? '/api/videos/categories' : null, 
    fetcher
  );

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/videos/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      });

      if (!response.ok) throw new Error('Не удалось создать категорию');

      toast({ title: 'Категория добавлена' });
      setNewCategoryName('');
      await mutate(); 
      onCategoryAdded();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка', description: error instanceof Error ? error.message : 'Произошла неизвестная ошибка.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/videos/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error('Не удалось обновить категорию');
      toast({ title: 'Категория обновлена' });
      await mutate();
      onCategoryAdded();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Ошибка', description: error instanceof Error ? error.message : 'Произошла неизвестная ошибка.' });
    }
  }

  const handleDelete = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/videos/categories/${categoryId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось удалить категорию');
      }
      toast({ title: 'Категория удалена' });
      await mutate();
      onCategoryAdded(); 
    } catch (error) {
       toast({ variant: 'destructive', title: 'Ошибка', description: error instanceof Error ? error.message : 'Произошла неизвестная ошибка.' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Редактировать категории
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Управление категориями</DialogTitle>
          <DialogDescription>
            Добавляйте, удаляйте или редактируйте категории для видео.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <form onSubmit={handleAddSubmit} className="flex items-center gap-2">
            <Input
              placeholder="Название новой категории..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <div className="h-4 w-4 border-2 border-border border-t-primary rounded-full animate-spin"/> : <PlusCircle className="h-4 w-4" />} 
            </Button>
          </form>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            <h4 className="font-medium text-sm text-muted-foreground">Существующие категории</h4>
            {isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}
            {error && <p className="text-sm text-destructive">Не удалось загрузить категории.</p>}
            {categoriesData && categoriesData.categories.length === 0 && (
              <p className="text-sm text-center text-muted-foreground py-4">Категорий пока нет.</p>
            )}
            {categoriesData?.categories.map((category) => (
              <CategoryItem key={category.id} category={category} onUpdate={handleUpdate} onDelete={handleDelete} />
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
