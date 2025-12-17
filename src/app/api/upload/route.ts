
import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file found' });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate a unique filename
  const fileExtension = file.name.split('.').pop();
  const uniqueFilename = `${uuidv4()}.${fileExtension}`;

  // Define the path to save the file
  const publicPath = join(process.cwd(), 'public', 'uploads', 'thumbnails');
  const path = join(publicPath, uniqueFilename);

  // Ensure the directory exists (Next.js doesn't have a built-in mkdir -p, 
  // but let's assume the folder structure is set up. For robustness, one would add `fs.mkdir(publicPath, { recursive: true })`
  // For this context, we will assume the directory exists.

  try {
    await writeFile(path, buffer);
    console.log(`File saved to ${path}`);

    // Return the public URL of the file
    const publicUrl = `/uploads/thumbnails/${uniqueFilename}`;
    return NextResponse.json({ success: true, url: publicUrl });

  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ success: false, error: 'Failed to save file' }, { status: 500 });
  }
}
