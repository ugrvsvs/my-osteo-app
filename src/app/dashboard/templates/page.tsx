'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Template } from '@/lib/types';
import useSWR from 'swr';
import { Skeleton } from '@/components/ui/skeleton';
import { AddTemplateDialog } from './_components/add-template-dialog';
import { FileStack } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function TemplateCard({ template }: { template: Template }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{template.name}</CardTitle>
        {template.description && <CardDescription>{template.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            Упражнений: {template.exercises.length}
          </p>
          <div className="flex flex-wrap gap-1">
            {template.exercises.map((ex, index) => (
              <Badge key={index} variant="secondary">
                {`${ex.sets}x${ex.reps}`}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
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
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
