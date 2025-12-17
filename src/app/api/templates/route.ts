import { NextResponse } from 'next/server';
import db from '@/lib/db';
import type { Template, Video } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get all templates with their exercises, now more robust
function getAllTemplatesWithExercises(): Template[] {
    // 1. Get all templates
    const templatesStmt = db.prepare('SELECT * FROM program_templates ORDER BY name');
    const templatesResult = templatesStmt.all() as Omit<Template, 'exercises'>[];

    if (templatesResult.length === 0) {
        return [];
    }

    // 2. Get all exercises for all templates in one go
    const templateIds = templatesResult.map(t => t.id);
    const placeholders = templateIds.map(() => '?').join(',');
    const exercisesStmt = db.prepare(`
        SELECT v.*, te.template_id, te.display_order
        FROM videos v
        JOIN template_exercises te ON v.id = te.video_id
        WHERE te.template_id IN (${placeholders})
    `);
    const allExercises = exercisesStmt.all(...templateIds) as (Video & { template_id: string; display_order: number })[];

    // 3. Map exercises to their templates
    const exercisesByTemplateId = new Map<string, (Video & { display_order: number })[]>();
    for (const exercise of allExercises) {
        if (!exercisesByTemplateId.has(exercise.template_id)) {
            exercisesByTemplateId.set(exercise.template_id, []);
        }
        exercisesByTemplateId.get(exercise.template_id)!.push(exercise);
    }

    // 4. Combine templates with their sorted exercises
    return templatesResult.map(template => {
        const exercises = exercisesByTemplateId.get(template.id) || [];
        const sortedExercises = exercises.sort((a, b) => a.display_order - b.display_order);
        return {
            ...template,
            exercises: sortedExercises,
        };
    });
}

// GET all program templates
export async function GET() {
    try {
        const templates = getAllTemplatesWithExercises();
        return NextResponse.json(templates);
    } catch (error) {
        console.error('Failed to retrieve program templates:', error);
        return NextResponse.json({ message: 'Не удалось получить шаблоны' }, { status: 500 });
    }
}

// CREATE a new program template
export async function POST(request: Request) {
    try {
        const { name, description, exercises } = await request.json();

        if (!name || typeof name !== 'string') {
             return NextResponse.json({ message: 'Название шаблона обязательно.' }, { status: 400 });
        }

        const newTemplateId = uuidv4();

        const createTransaction = db.transaction(() => {
            db.prepare(
                'INSERT INTO program_templates (id, name, description) VALUES (?, ?, ?)'
            ).run(newTemplateId, name, description || '');

            if (exercises && Array.isArray(exercises) && exercises.length > 0) {
                const insertStmt = db.prepare('INSERT INTO template_exercises (template_id, video_id, display_order) VALUES (?, ?, ?)');
                for (let i = 0; i < exercises.length; i++) {
                    if (exercises[i] && exercises[i].id) {
                       insertStmt.run(newTemplateId, exercises[i].id, i);
                    }
                }
            }
        });

        createTransaction();

        // CORRECTED RESPONSE: Return the full, updated list of all templates.
        // This prevents the SWR cache from being poisoned with a single object.
        const allTemplates = getAllTemplatesWithExercises();
        
        return NextResponse.json(allTemplates, { status: 201 });

    } catch (error) {
        console.error('Failed to create template:', error);
        if (error instanceof Error && 'code' in error && error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
             return NextResponse.json({ message: `Шаблон с названием "${name}" уже существует.` }, { status: 409 });
        }
        return NextResponse.json({ message: 'Не удалось создать шаблон' }, { status: 500 });
    }
}
