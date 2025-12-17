
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM video_categories ORDER BY name');
    const categories = stmt.all();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Failed to retrieve categories:', error);
    return NextResponse.json({ message: 'Failed to retrieve categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const validation = categorySchema.safeParse(data);

    if (!validation.success) {
      return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400 });
    }

    const { name } = validation.data;
    const id = uuidv4();

    try {
      const stmt = db.prepare('INSERT INTO video_categories (id, name) VALUES (?, ?)');
      const info = stmt.run(id, name);
      
      if (info.changes > 0) {
        const newCategory = db.prepare('SELECT * FROM video_categories WHERE id = ?').get(id);
        return NextResponse.json(newCategory, { status: 201 });
      } else {
        return NextResponse.json({ message: 'Failed to create category' }, { status: 500 });
      }
    } catch (error: any) {
       if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
         return NextResponse.json({ message: 'A category with this name already exists' }, { status: 409 });
       }
       throw error; 
    }

  } catch (error) {
    console.error('Failed to create category:', error);
    return NextResponse.json({ message: 'Failed to create category' }, { status: 500 });
  }
}
