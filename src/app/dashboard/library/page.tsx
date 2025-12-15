import { mockVideos } from '@/lib/data';
import type { Video } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Clock } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/app/icons';

const zoneTranslations: Record<Video['zone'], string> = {
  spine: 'Позвоночник',
  knee: 'Колено',
  shoulder: 'Плечо',
  foot: 'Стопа',
  hand: 'Кисть',
  general: 'Общее'
};

const levelTranslations: Record<Video['level'], string> = {
    beginner: 'Новичок',
    intermediate: 'Средний',
    advanced: 'Продвинутый'
}

function VideoCard({ video }: { video: Video }) {
  const ZoneIcon = Icons[video.zone];

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover"
            data-ai-hint="yoga stretching"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="mb-2 text-base font-bold">{video.title}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 p-4 pt-0">
        <div className="flex w-full justify-between text-sm text-muted-foreground">
           <div className="flex items-center gap-1">
             <Clock className="h-4 w-4" />
             <span>{video.duration}</span>
           </div>
           <div className="flex items-center gap-1 capitalize">
             {ZoneIcon && <ZoneIcon className="h-4 w-4" />}
             <span>{zoneTranslations[video.zone]}</span>
           </div>
        </div>
        <div>
            <Badge variant="outline">{levelTranslations[video.level]}</Badge>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LibraryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Библиотека Видео</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Поиск видео..." className="pl-8 sm:w-[300px]" />
          </div>
          <Button>
            <PlusCircle />
            Добавить видео
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
