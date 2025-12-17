
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const patientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("A valid email is required"),
});

// GET all patients (Simplified)
export function GET() {
  try {
    const stmt = db.prepare(`
      SELECT 
        p.*, 
        (SELECT MAX(date) FROM activity_log WHERE patient_id = p.id) as lastActivity
      FROM patients p 
      ORDER BY p.name
    `);
    const patients = stmt.all();
    return NextResponse.json(patients);
  } catch (error) {
    console.error('Failed to retrieve patients:', error);
    return NextResponse.json({ message: 'Failed to retrieve patients' }, { status: 500 });
  }
}

// POST a new patient (Rewritten for clarity and correctness)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const validation = patientSchema.safeParse(data);

    if (!validation.success) {
      return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400 });
    }

    const { name, email } = validation.data;
    
    // Generate all required fields for the new patient
    const id = uuidv4();
    const shareId = `share-${uuidv4()}`;
    const avatarUrl = `https://avatar.vercel.sh/${email}.png`;
    
    const stmt = db.prepare(`
        INSERT INTO patients (id, name, email, avatarUrl, shareId)
        VALUES (?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(id, name, email, avatarUrl, shareId);

    if (info.changes === 0) {
        // This case would be unusual, but it's good to handle it.
        return NextResponse.json({ message: 'Failed to write patient to the database' }, { status: 500 });
    }

    const newPatient = { 
        id,
        name,
        email,
        avatarUrl,
        shareId,
        lastActivity: null // New patients don't have activity
    };
    
    return NextResponse.json(newPatient, { status: 201 });

  } catch (error: any) {
    console.error('Error creating patient:', error);

    // Specifically handle unique constraint errors (e.g., duplicate email)
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return NextResponse.json({ message: 'Пациент с таким email уже существует' }, { status: 409 });
    }

    // Generic error for all other cases
    return NextResponse.json({ message: 'Не удалось создать пациента' }, { status: 500 });
  }
}
