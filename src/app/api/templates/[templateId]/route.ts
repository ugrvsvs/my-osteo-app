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
      return [];
    }
    throw new Error('Error reading templates data file');
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { templateId: string } }
) {
  try {
    const { templateId } = params;
    const updatedData = await request.json();

    let templates = await getTemplates();
    
    const templateIndex = templates.findIndex(t => t.id === templateId);

    if (templateIndex === -1) {
      return NextResponse.json({ message: 'Шаблон не найден' }, { status: 404 });
    }
    
    // Update template data
    templates[templateIndex] = { ...templates[templateIndex], ...updatedData };

    await fs.writeFile(jsonPath, JSON.stringify(templates, null, 2));

    return NextResponse.json(templates[templateIndex]);
  } catch (error) {
    console.error('Failed to update template:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { templateId: string } }
) {
    try {
        const { templateId } = params;
        let templates = await getTemplates();

        const templateExists = templates.some(t => t.id === templateId);
        if (!templateExists) {
            return NextResponse.json({ message: 'Шаблон не найден' }, { status: 404 });
        }

        const updatedTemplates = templates.filter(t => t.id !== templateId);

        await fs.writeFile(jsonPath, JSON.stringify(updatedTemplates, null, 2));

        return NextResponse.json({ message: 'Шаблон успешно удален' }, { status: 200 });

    } catch (error) {
        console.error('Failed to delete template:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message }, { status: 500 });
    }
}
