
import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET a single patient by ID
export function GET(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const { patientId } = params;

    const patientStmt = db.prepare('SELECT * FROM patients WHERE id = ?');
    const patient = patientStmt.get(patientId);

    if (!patient) {
      return NextResponse.json({ message: 'Пациент не найден' }, { status: 404 });
    }

    const exerciseStmt = db.prepare(`
        SELECT 
            v.id, v.title, v.description, v.thumbnailUrl, v.duration, ax.display_order as "order"
        FROM assigned_exercises ax
        JOIN videos v ON v.id = ax.video_id
        WHERE ax.patient_id = ?
        ORDER BY ax.display_order
    `);
    const assignedExercisesRaw = exerciseStmt.all(patientId);
    
    const assignedExercises = assignedExercisesRaw.map(row => ({
        patient_id: patientId,
        video_id: row.id,
        display_order: row.order,
        video: {
            id: row.id,
            title: row.title,
            description: row.description,
            thumbnailUrl: row.thumbnailUrl,
            duration: row.duration,
        }
    }));

    // REMOVED: No longer fetching activity log.
    const patientData = {
        ...patient,
        assignedExercises: assignedExercises || [],
    };

    return NextResponse.json(patientData);
  } catch (error) {
    console.error(`Failed to retrieve patient [${params.patientId}]:`, error);
    return NextResponse.json({ message: 'Не удалось получить данные пациента' }, { status: 500 });
  }
}


// DELETE a patient
export function DELETE(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const { patientId } = params;

    const deletePatient = db.transaction(() => {
      const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(patientId);
      if (!patient) return { changes: 0 };
      
      db.prepare('DELETE FROM assigned_exercises WHERE patient_id = ?').run(patientId);
      // REMOVED: No longer deleting from activity_log
      const result = db.prepare('DELETE FROM patients WHERE id = ?').run(patientId);
      return result;
    });

    const result = deletePatient();

    if (result.changes === 0) {
      // Patient not found, but DELETE is idempotent.
    }

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error(`Failed to delete patient [${params.patientId}]:`, error);
    return NextResponse.json({ message: 'Не удалось удалить пациента' }, { status: 500 });
  }
}
