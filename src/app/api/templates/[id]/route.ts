import { NextResponse } from 'next/server';
import db from '@/lib/db';
import type { Template, Video } from '@/lib/types';

// Helper function to get all templates. This is duplicated from the other route file.
// In a real app, this would be in a shared lib/data-access file.
function getAllTemplatesWithExercises(): Template[] {
    const templatesStmt = db.prepare('SELECT * FROM program_templates ORDER BY name');
    const templatesResult = templatesStmt.all() as Omit<Template, 'exercises'>[];
    if (templatesResult.length === 0) return [];

    const templateIds = templatesResult.map(t => t.id);
    const placeholders = templateIds.map(() => '?').join(',');
    const exercisesStmt = db.prepare(`
        SELECT v.*, te.template_id, te.display_order
        FROM videos v
        JOIN template_exercises te ON v.id = te.video_id
        WHERE te.template_id IN (${placeholders})
    `);
    const allExercises = exercisesStmt.all(...templateIds) as (Video & { template_id: string; display_order: number })[];

    const exercisesByTemplateId = new Map<string, (Video & { display_order: number })[]>();
    for (const exercise of allExercises) {
        if (!exercisesByTemplateId.has(exercise.template_id)) {
            exercisesByTemplateId.set(exercise.template_id, []);
        }
        exercisesByTemplateId.get(exercise.template_id)!.push(exercise);
    }

    return templatesResult.map(template => {
        const exercises = exercisesByTemplateId.get(template.id) || [];
        const sortedExercises = exercises.sort((a, b) => a.display_order - b.display_order);
        return {
            ...template,
            exercises: sortedExercises,
        };
    });
}

// UPDATE a specific template
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const templateId = params.id;
    try {
        const { name, description, exercises } = await request.json();

        if (!name || typeof name !== 'string') {
            return NextResponse.json({ message: 'Название шаблона обязательно.' }, { status: 400 });
        }

        const updateTransaction = db.transaction(() => {
            // Update the template details
            db.prepare(
                'UPDATE program_templates SET name = ?, description = ? WHERE id = ?'
            ).run(name, description || '', templateId);

            // Delete existing exercises for this template
            db.prepare('DELETE FROM template_exercises WHERE template_id = ?').run(templateId);

            // Add the new set of exercises
            if (exercises && Array.isArray(exercises) && exercises.length > 0) {
                const insertStmt = db.prepare('INSERT INTO template_exercises (template_id, video_id, display_order) VALUES (?, ?, ?)');
                for (let i = 0; i < exercises.length; i++) {
                    if (exercises[i] && exercises[i].id) {
                        insertStmt.run(templateId, exercises[i].id, i);
                    }
                }
            }
        });

        updateTransaction();

        // CORRECT RESPONSE: Return the full, updated list of all templates.
        const allTemplates = getAllTemplatesWithExercises();
        return NextResponse.json(allTemplates, { status: 200 });

    } catch (error) {
        console.error(`Failed to update template ${templateId}:`, error);
        return NextResponse.json({ message: `Не удалось обновить шаблон ${templateId}` }, { status: 500 });
    }
}

// DELETE a specific template
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const templateId = params.id;
    try {
        const deleteTransaction = db.transaction(() => {
            // First, delete associated exercises
            db.prepare('DELETE FROM template_exercises WHERE template_id = ?').run(templateId);
            // Then, delete the template itself
            db.prepare('DELETE FROM program_templates WHERE id = ?').run(templateId);
        });

        deleteTransaction();

        // CORRECT RESPONSE: Return the full, updated list of remaining templates.
        const allTemplates = getAllTemplatesWithExercises();
        return NextResponse.json(allTemplates, { status: 200 });

    } catch (error) {
        console.error(`Failed to delete template ${templateId}:`, error);
        return NextResponse.json({ message: `Не удалось удалить шаблон ${templateId}` }, { status: 500 });
    }
}
