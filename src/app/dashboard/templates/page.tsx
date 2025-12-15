'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function TemplateCard({ template, onUpdate }: { template: Template; onUpdate: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Не удалось удалить шаблон.');
      }
      toast({ title: 'Шаблон удален' });
      onUpdate();
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
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            Упражнений: {template.exercises.length}
          </p>
          <div className="flex flex-wrap gap-1">
            {template.exercises.slice(0, 5).map((ex, index) => (
              <Badge key={index} variant="secondary">
                {`${ex.sets}x${ex.reps}`}
              </Badge>
            ))}
            {template.exercises.length > 5 && (
                <Badge variant="outline">+{template.exercises.length - 5} еще</Badge>
            )}
          </div>
        </div>
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Шаблоны</h1>
        <AddTemplateDialog onTemplateAdded={mutate} />
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                 <div className="flex w-full justify-end gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                 </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {error && <p className="text-destructive">Не удалось загрузить шаблоны.</p>}

      {!isLoading && data && (
        <>
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 py-24 text-center">
              <FileStack className="h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">Шаблоны не найдены</h2>
              <p className="text-muted-foreground">Создайте свой первый шаблон, чтобы ускорить назначение упражнений.</p>
              <div className="mt-6">
                <AddTemplateDialog onTemplateAdded={mutate} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((template) => (
                <TemplateCard key={template.id} template={template} onUpdate={mutate} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
