import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { Video } from '@/lib/types';

const jsonPath = path.join(process.cwd(), 'src', 'data', 'videos.json');

async function getVideos(): Promise<Video[]> {
  try {
    const fileContent = await fs.readFile(jsonPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw new Error('Error reading data file');
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    const { videoId } = params;
    const updatedData = await request.json();

    let videos = await getVideos();
    
    const videoIndex = videos.findIndex(v => v.id === videoId);

    if (videoIndex === -1) {
      return NextResponse.json({ message: 'Video not found' }, { status: 404 });
    }
    
    // Update video data
    videos[videoIndex] = { ...videos[videoIndex], ...updatedData };

    await fs.writeFile(jsonPath, JSON.stringify(videos, null, 2));

    return NextResponse.json(videos[videoIndex]);
  } catch (error) {
    console.error('Failed to update video:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
  }
}
