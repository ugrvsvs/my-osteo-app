'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Template } from '@/lib/types';
import useSWR from 'swr';
import { Skeleton } from '@/components/ui/skeleton';
import { AddTemplateDialog } from './_components/add-template-dialog';
import { FileStack, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditTemplateDialog } from './_components/edit-template-dialog';
import { useState } from 'react';
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
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

// ROBUST FETCHER: This fetcher handles HTTP errors.
const fetcher = async (url: string) => {
  const res = await fetch(url);

  // If the status code is not in the range 200-299, it's an error.
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object.
    try {
        error.info = await res.json();
    } catch (e) {
        error.info = { message: res.statusText };
    }
    error.status = res.status;
    throw error;
  }

  return res.json();
};

function TemplateCard({ template, onUpdate }: { template: Template; onUpdate: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: 'DELETE',
      });
      // This check is now redundant because the fetcher would throw, but it's good for defense-in-depth.
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось удалить шаблон.');
      }
      toast({ title: 'Шаблон удален' });
      onUpdate(); // Revalidate the list
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Произошла ошибка.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{template.name}</CardTitle>
        {template.description && <CardDescription>{template.description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">
          Упражнений: {template.exercises.length}
        </p>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex w-full justify-end gap-2">
          <EditTemplateDialog template={template} onTemplateUpdated={onUpdate}>
            <Button variant="ghost" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          </EditTemplateDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие невозможно отменить. Шаблон "{template.name}" будет навсегда удален.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                  {isDeleting ? 'Удаление...' : 'Удалить'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function TemplatesPage() {
  const { data, error, isLoading, mutate } = useSWR<Template[]>('/api/templates', fetcher);

  // Render error state
  if (error) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-destructive/50 bg-destructive/10 py-24 text-center">
            <h2 className="text-xl font-semibold">Не удалось загрузить шаблоны</h2>
            <p className="text-destructive/80">{(error.info as any)?.message || error.message}</p>
        </div>
    );
  }
  
  // Render loading state
  if (isLoading) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-5 w-1/4" />
              </CardContent>
              <CardFooter className="border-t pt-4">
                 <div className="flex w-full justify-end gap-2">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                 </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      );
  }

  // Render content
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Шаблоны</h1>
        <AddTemplateDialog onTemplateAdded={mutate} />
      </div>

      {data && data.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 py-24 text-center">
          <FileStack className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Шаблоны не найдены</h2>
          <p className="text-muted-foreground">Создайте свой первый шаблон, чтобы ускорить назначение упражнений.</p>
          <div className="mt-6">
            <AddTemplateDialog onTemplateAdded={mutate} />
          </div>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((template) => (
            <TemplateCard key={template.id} template={template} onUpdate={mutate} />
          ))}
        </div>
      )}
    </div>
  );
}
