import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { Video } from '@/lib/types';

export async function GET() {
  try {
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'videos.json');
    const fileContent = await fs.readFile(jsonPath, 'utf-8');
    const videos: Video[] = JSON.parse(fileContent);
    return NextResponse.json(videos);
  } catch (error) {
    console.error('Failed to read videos data:', error);
    return NextResponse.json({ message: 'Error reading data file' }, { status: 500 });
  }
}
