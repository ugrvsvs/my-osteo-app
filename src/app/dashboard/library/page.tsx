'use client';
import type { Video, VideoCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Clock, GripVertical } from 'lucide-react';
import Image from 'next/image';
import useSWR from 'swr';
import { Skeleton } from '@/components/ui/skeleton';
import { AddVideoDialog } from './_components/add-video-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AddCategoryDialog } from './_components/add-category-dialog';
import { useState } from 'react';
import { EditVideoDialog } from './_components/edit-video-dialog';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function VideoListItem({ video, allCategories, onVideoUpdated }: { video: Video; allCategories: VideoCategory[]; onVideoUpdated: () => void; }) {
  return (
    <div className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50 group">
      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
      <Image
        src={video.thumbnailUrl}
        alt={video.title}
        width={100}
        height={56}
        className="rounded-md aspect-video object-cover"
        data-ai-hint="yoga stretching"
      />
      <div className="flex-1">
        <p className="font-semibold">{video.title}</p>
        <p className="text-sm text-muted-foreground line-clamp-1">{video.description}</p>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>{video.duration}</span>
      </div>
      <EditVideoDialog video={video} allCategories={allCategories} onVideoUpdated={onVideoUpdated}>
        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Редактировать</Button>
      </EditVideoDialog>
    </div>
  );
}

export default function LibraryPage() {
  const { data: videos, error: videosError, isLoading: videosLoading, mutate: mutateVideos } = useSWR<Video[]>('/api/videos', fetcher);
  const { data: categoriesData, error: categoriesError, isLoading: categoriesLoading, mutate: mutateCategories } = useSWR<{ categories: VideoCategory[] }>('/api/videos/categories', fetcher);
  
  const [searchTerm, setSearchTerm] = useState('');

  const categories = categoriesData?.categories || [];

  const handleMutateAll = () => {
    mutateVideos();
    mutateCategories();
  };

  const filteredVideos = videos?.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const videosByCategory = filteredVideos?.reduce((acc, video) => {
    const categoryId = video.categoryId || 'uncategorized';
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(video);
    return acc;
  }, {} as Record<string, Video[]>);

  const uncategorizedVideos = videosByCategory?.['uncategorized'] || [];
  
  const isLoading = videosLoading || categoriesLoading;
  const error = videosError || categoriesError;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Библиотека Видео</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Поиск видео..." 
              className="pl-8 sm:w-[300px]" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <AddCategoryDialog onCategoryAdded={handleMutateAll} />
          <AddVideoDialog onVideoAdded={handleMutateAll} allCategories={categories} />
        </div>
      </div>
      
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
             <div key={i} className="border rounded-md p-4">
                <Skeleton className="h-6 w-1/4 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
             </div>
          ))}
        </div>
      )}
      {error && <p className="text-destructive">Не удалось загрузить данные библиотеки.</p>}

      {!isLoading && videosByCategory && (
        <Accordion type="multiple" defaultValue={categories.map(c => c.id).concat(['uncategorized'])} className="w-full space-y-4">
           {categories.map(category => (
             <AccordionItem value={category.id} key={category.id} className="border rounded-md bg-card overflow-hidden">
               <AccordionTrigger className="px-4 py-3 text-lg font-semibold hover:no-underline">
                 {category.name}
               </AccordionTrigger>
               <AccordionContent className="p-2 pt-0">
                  <div className="flex flex-col gap-1">
                    {(videosByCategory[category.id] || []).map(video => (
                      <VideoListItem key={video.id} video={video} allCategories={categories} onVideoUpdated={handleMutateAll} />
                    ))}
                     {(!videosByCategory[category.id] || videosByCategory[category.id].length === 0) && (
                       <p className="p-4 text-center text-sm text-muted-foreground">В этой категории пока нет видео.</p>
                     )}
                  </div>
               </AccordionContent>
             </AccordionItem>
           ))}
            <AccordionItem value="uncategorized" className="border rounded-md bg-card overflow-hidden">
               <AccordionTrigger className="px-4 py-3 text-lg font-semibold hover:no-underline">
                 Без категории
               </AccordionTrigger>
               <AccordionContent className="p-2 pt-0">
                  <div className="flex flex-col gap-1">
                    {uncategorizedVideos.map(video => (
                      <VideoListItem key={video.id} video={video} allCategories={categories} onVideoUpdated={handleMutateAll} />
                    ))}
                    {uncategorizedVideos.length === 0 && (
                       <p className="p-4 text-center text-sm text-muted-foreground">Нет видео без категории.</p>
                     )}
                  </div>
               </AccordionContent>
             </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
