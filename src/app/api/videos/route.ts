
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const videoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().min(1, "Video URL is required").url("A valid URL is required"),
  duration: z.string().min(1, "Duration is required"),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  // Allow categoryId to be null or a string
  categoryId: z.string().nullable().optional(),
});

// GET all videos with their category names
export function GET() {
  try {
    const stmt = db.prepare(`
      SELECT v.*, c.name as categoryName 
      FROM videos v
      LEFT JOIN video_categories c ON v.categoryId = c.id
      ORDER BY v.title
    `);
    const videos = stmt.all();
    return NextResponse.json(videos);
  } catch (error) {
    console.error('Failed to retrieve videos:', error);
    return NextResponse.json({ message: 'Failed to retrieve videos' }, { status: 500 });
  }
}

// POST a new video (Rewritten for correctness)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const validation = videoSchema.safeParse(data);

    if (!validation.success) {
      console.error('Video validation failed:', validation.error.errors);
      return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400 });
    }

    const { title, url, duration, description, thumbnailUrl, categoryId } = validation.data;
    const id = uuidv4();
    // Use a default placeholder if no thumbnail is provided
    const finalThumbnailUrl = thumbnailUrl || '/placeholder.svg';

    // Use NULL for categoryId if it's not provided or is null
    const finalCategoryId = categoryId === 'null' || categoryId === '' ? null : categoryId;

    const insertStmt = db.prepare(`
      INSERT INTO videos (id, title, description, url, thumbnailUrl, duration, categoryId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = insertStmt.run(id, title, description || '', url, finalThumbnailUrl, duration, finalCategoryId);

    if (info.changes === 0) {
        return NextResponse.json({ message: 'Failed to write video to the database' }, { status: 500 });
    }

    // Fetch the newly created video along with its category name to return to the client
    const newVideoStmt = db.prepare(`
        SELECT v.*, c.name as categoryName
        FROM videos v
        LEFT JOIN video_categories c ON v.categoryId = c.id
        WHERE v.id = ?
    `);
    const newVideo = newVideoStmt.get(id);

    return NextResponse.json(newVideo, { status: 201 });

  } catch (error) {
    console.error('Failed to create video:', error);
    return NextResponse.json({ message: 'Не удалось создать видео' }, { status: 500 });
  }
}
