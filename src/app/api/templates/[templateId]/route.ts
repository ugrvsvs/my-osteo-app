import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { Template } from '@/lib/types';

// Helper to get all templates, because we need it in multiple places
function getAllTemplatesWithExercises(): Template[] {
    const templatesStmt = db.prepare('SELECT * FROM program_templates ORDER BY name');
    const templates = templatesStmt.all() as Omit<Template, 'exercises'>[];

    const templatesWithExercises = templates.map(template => {
        const exercisesStmt = db.prepare(`
            SELECT v.*, te.display_order as "order"
            FROM videos v
            JOIN template_exercises te ON v.id = te.video_id
            WHERE te.template_id = ?
            ORDER BY te.display_order ASC
        `);
        const exercises = exercisesStmt.all(template.id);
        return {
            ...template,
            exercises: exercises,
        };
    });
    return templatesWithExercises;
}

// Helper to get a single full template
function getFullTemplate(templateId: string): Template | null {
    const template = getAllTemplatesWithExercises().find(t => t.id === templateId);
    return template || null;
}

// GET a single template by ID
export async function GET(request: Request, { params }: { params: { templateId: string } }) {
    try {
        const template = getFullTemplate(params.templateId);
        if (!template) {
            return NextResponse.json({ message: 'Шаблон не найден' }, { status: 404 });
        }
        return NextResponse.json(template);
    } catch (error) {
        console.error(`Failed to retrieve template [${params.templateId}]:`, error);
        return NextResponse.json({ message: 'Не удалось получить шаблон' }, { status: 500 });
    }
}


// UPDATE a template
export async function PUT(request: Request, { params }: { params: { templateId: string } }) {
    try {
        const { name, description, exercises } = await request.json();
        const { templateId } = params;

        db.transaction(() => {
            const templateExists = db.prepare('SELECT id FROM program_templates WHERE id = ?').get(templateId);
            if (!templateExists) throw new Error('Шаблон не найден');

            db.prepare('UPDATE program_templates SET name = ?, description = ? WHERE id = ?').run(name, description, templateId);
            db.prepare('DELETE FROM template_exercises WHERE template_id = ?').run(templateId);

            if (exercises && exercises.length > 0) {
                const insertStmt = db.prepare('INSERT INTO template_exercises (template_id, video_id, display_order) VALUES (?, ?, ?)');
                for (let i = 0; i < exercises.length; i++) {
                    insertStmt.run(templateId, exercises[i].id, i);
                }
            }
        })();
        
        // SUCCESS: Return the full, updated list of all templates
        const allTemplates = getAllTemplatesWithExercises();
        return NextResponse.json(allTemplates);

    } catch (error) {
        console.error(`Failed to update template [${params.templateId}]:`, error);
        const message = error instanceof Error && error.message === 'Шаблон не найден' ? error.message : 'Не удалось обновить шаблон';
        const status = error instanceof Error && error.message === 'Шаблон не найден' ? 404 : 500;
        return NextResponse.json({ message }, { status });
    }
}


// DELETE a template
export async function DELETE(request: Request, { params }: { params: { templateId: string } }) {
    try {
        const { templateId } = params;

        const result = db.prepare('DELETE FROM program_templates WHERE id = ?').run(templateId);

        if (result.changes === 0) {
            // If no rows were deleted, the template didn't exist. 
            // It's idempotent, so we can still return success by returning the current list.
        } else {
            // We don't need to delete from template_exercises because of foreign key `ON DELETE CASCADE`
        }

        // SUCCESS: Return the full, updated list of all templates
        const allTemplates = getAllTemplatesWithExercises();
        return NextResponse.json(allTemplates);

    } catch (error) {
        console.error(`Failed to delete template [${params.templateId}]:`, error);
        return NextResponse.json({ message: 'Не удалось удалить шаблон' }, { status: 500 });
    }
}
