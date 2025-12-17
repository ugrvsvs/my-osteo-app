
import { writeFile, mkdir } from 'fs/promises';
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

  try {
    // Ensure the directory exists
    await mkdir(publicPath, { recursive: true });

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
