
import { NextResponse } from 'next/server';
import db from '@/lib/db';

// This function handles GET requests to /api/share/[patientShareId]
export async function GET(
  request: Request,
  { params }: { params: { patientShareId: string } }
) {
  try {
    const { patientShareId } = params;

    if (!patientShareId) {
      return NextResponse.json({ message: 'Share ID is required' }, { status: 400 });
    }

    // Find the patient by their shareId
    const patientStmt = db.prepare('SELECT id, name, avatarUrl, shareId FROM patients WHERE shareId = ?');
    const patient = patientStmt.get(patientShareId);

    if (!patient) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }

    // Find the assigned exercises for the patient and join with video details
    const exercisesStmt = db.prepare(`
      SELECT
        ax.display_order as "order",
        v.id as "videoId",
        v.title,
        v.description,
        v.thumbnailUrl,
        v.duration
      FROM assigned_exercises ax
      JOIN videos v ON v.id = ax.video_id
      WHERE ax.patient_id = ?
      ORDER BY "order" ASC
    `);

    const exercises = exercisesStmt.all(patient.id);

    // Structure the data as the frontend expects it
    const assignedExercises = exercises.map(ex => ({
      order: ex.order,
      videoId: ex.videoId,
      video: {
        id: ex.videoId,
        title: ex.title,
        description: ex.description,
        thumbnailUrl: ex.thumbnailUrl,
        duration: ex.duration,
      }
    }));


    // Combine patient info with their exercises
    const patientPlan = {
      ...patient,
      assignedExercises: assignedExercises || [],
    };

    return NextResponse.json(patientPlan);

  } catch (error) {
    console.error(`[API/SHARE] Failed to retrieve patient plan for shareId [${params.patientShareId}]:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
