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

export async function GET() {
  try {
    const videos = await getVideos();
    return NextResponse.json(videos);
  } catch (error) {
    console.error('Failed to read videos data:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const newVideoData = await request.json();
        const videos = await getVideos();

        // Basic validation
        if (!newVideoData.title || !newVideoData.url || !newVideoData.duration) {
            return NextResponse.json({ message: 'Title, URL, and Duration are required' }, { status: 400 });
        }

        const newVideo: Video = {
            id: `vid${Date.now()}`, // Simple unique ID generation
            ...newVideoData,
            thumbnailUrl: newVideoData.thumbnailUrl || `https://picsum.photos/seed/${Date.now()}/1280/720`,
        };
        
        videos.push(newVideo);

        await fs.writeFile(jsonPath, JSON.stringify(videos, null, 2));

        return NextResponse.json(newVideo, { status: 201 });

    } catch (error) {
        console.error('Failed to create video:', error);
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
    }
}
