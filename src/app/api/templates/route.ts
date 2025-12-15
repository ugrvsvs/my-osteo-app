import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { Template } from '@/lib/types';

const jsonPath = path.join(process.cwd(), 'src', 'data', 'templates.json');

async function getTemplates(): Promise<Template[]> {
  try {
    const fileContent = await fs.readFile(jsonPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      await fs.writeFile(jsonPath, JSON.stringify([], null, 2));
      return [];
    }
    throw new Error('Error reading templates data file');
  }
}

export async function GET() {
  try {
    const templates = await getTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const newTemplateData = await request.json();
        let templates = await getTemplates();

        if (!newTemplateData.name || !newTemplateData.exercises || newTemplateData.exercises.length === 0) {
            return NextResponse.json({ message: 'Name and at least one exercise are required' }, { status: 400 });
        }

        const newTemplate: Template = {
            id: `tpl${Date.now()}`,
            name: newTemplateData.name,
            description: newTemplateData.description || '',
            exercises: newTemplateData.exercises,
        };
        
        templates.push(newTemplate);

        await fs.writeFile(jsonPath, JSON.stringify(templates, null, 2));

        return NextResponse.json(newTemplate, { status: 201 });

    } catch (error) {
        console.error('Failed to create template:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message }, { status: 500 });
    }
}
