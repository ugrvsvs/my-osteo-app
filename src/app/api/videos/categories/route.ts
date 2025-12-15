import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { VideoCategory } from '@/lib/types';

const jsonPath = path.join(process.cwd(), 'src', 'data', 'video-categories.json');

async function getCategories(): Promise<VideoCategory[]> {
  try {
    const fileContent = await fs.readFile(jsonPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      // If file doesn't exist, create it with an empty array
      await fs.writeFile(jsonPath, JSON.stringify([], null, 2));
      return [];
    }
    throw new Error('Error reading video categories data file');
  }
}

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const newCategoryData = await request.json();
        let categories = await getCategories();

        if (!newCategoryData.name) {
            return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        }

        const newCategory: VideoCategory = {
            id: `cat${Date.now()}`,
            name: newCategoryData.name,
        };
        
        categories.push(newCategory);

        await fs.writeFile(jsonPath, JSON.stringify(categories, null, 2));

        return NextResponse.json(newCategory, { status: 201 });

    } catch (error) {
        console.error('Failed to create category:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message }, { status: 500 });
    }
}
