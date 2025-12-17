
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

const videoUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  url: z.string().url("A valid URL is required").optional(),
  duration: z.string().min(1, "Duration is required").optional(),
  description: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

// PUT (update) a video
export async function PUT(
  request: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    const { videoId } = params;
    const data = await request.json();
    const validation = videoUpdateSchema.safeParse(data);

    if (!validation.success) {
      return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400 });
    }

    const existingVideo = db.prepare('SELECT * FROM videos WHERE id = ?').get(videoId);
    if (!existingVideo) {
        return NextResponse.json({ message: 'Video not found' }, { status: 404 });
    }

    const { title, description, url, thumbnailUrl, duration, categoryId } = validation.data;

    const fields = {
        title,
        description,
        url,
        thumbnailUrl,
        duration,
        categoryId,
        ...validation.data,
    };

    let setClause = Object.keys(fields).filter(key => fields[key] !== undefined).map(key => `${key} = ?`).join(', ');
    let values = Object.values(fields).filter(val => val !== undefined);

    if (values.length === 0) {
        return NextResponse.json({ message: "No fields to update" }, { status: 400 });
    }

    values.push(videoId);

    const stmt = db.prepare(`UPDATE videos SET ${setClause} WHERE id = ?`);
    const info = stmt.run(...values);

    if (info.changes > 0) {
      const updatedVideo = db.prepare('SELECT * FROM videos WHERE id = ?').get(videoId);
      return NextResponse.json(updatedVideo);
    } else {
      return NextResponse.json({ message: 'Update failed, video not found or data unchanged' }, { status: 404 });
    }

  } catch (error) {
    console.error('Failed to update video:', error);
    return NextResponse.json({ message: 'Failed to update video' }, { status: 500 });
  }
}

// DELETE a video
export function DELETE(
  request: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    const { videoId } = params;
    
    const stmt = db.prepare('DELETE FROM videos WHERE id = ?');
    const info = stmt.run(videoId);

    if (info.changes > 0) {
      return NextResponse.json({ message: 'Video deleted successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Video not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Failed to delete video:', error);
    return NextResponse.json({ message: 'Failed to delete video' }, { status: 500 });
  }
}
