
import Database from 'better-sqlite3';
import path from 'path';
import { promises as fs } from 'fs';
import type { Video, Patient, VideoCategory } from '@/lib/types';

const dbPath = path.join(process.cwd(), 'database.db');
// Initialize the database connection
const db = new Database(dbPath, { /* verbose: console.log */ });

// --- Schema Definition ---
const createSchema = () => {
  console.log('Attempting to create database schema...');

  const schema = `
    CREATE TABLE IF NOT EXISTS video_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      url TEXT NOT NULL,
      thumbnailUrl TEXT,
      duration TEXT NOT NULL,
      categoryId TEXT,
      FOREIGN KEY (categoryId) REFERENCES video_categories (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      avatarUrl TEXT,
      shareId TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS assigned_exercises (
        patient_id TEXT NOT NULL,
        video_id TEXT NOT NULL,
        display_order INTEGER NOT NULL,
        PRIMARY KEY (patient_id, video_id),
        FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
        FOREIGN KEY (video_id) REFERENCES videos (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        date TEXT NOT NULL,
        activity TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
    );
  `;
  db.exec(schema);
  console.log('Schema creation successful.');
};

// --- Data Migration --- 
const migrateData = async () => {
  console.log('Checking if data migration is needed...');

  // Check if categories table is empty
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM video_categories').get() as { count: number };
  if (categoryCount.count === 0) {
    console.log('Migrating categories...');
    const categoriesPath = path.join(process.cwd(), 'src', 'data', 'video-categories.json');
    try {
      const data = await fs.readFile(categoriesPath, 'utf-8');
      const categories: VideoCategory[] = JSON.parse(data);
      const stmt = db.prepare('INSERT OR IGNORE INTO video_categories (id, name) VALUES (?, ?)');
      db.transaction((cats) => {
        for (const cat of cats) stmt.run(cat.id, cat.name);
      })(categories);
      console.log('Categories migration successful.');
    } catch (e) { 
        if (e instanceof Error && 'code' in e && e.code !== 'ENOENT') { console.error('Error migrating categories:', e);}
        else { console.log('No category data file to migrate.'); }
    }
  }

  // Check if videos table is empty
  const videoCount = db.prepare('SELECT COUNT(*) as count FROM videos').get() as { count: number };
  if (videoCount.count === 0) {
    console.log('Migrating videos...');
    const videosPath = path.join(process.cwd(), 'src', 'data', 'videos.json');
    try {
        const data = await fs.readFile(videosPath, 'utf-8');
        const videos: Video[] = JSON.parse(data);
        const stmt = db.prepare('INSERT OR IGNORE INTO videos (id, title, description, url, thumbnailUrl, duration, categoryId) VALUES (?, ?, ?, ?, ?, ?, ?)');
        db.transaction((vids) => {
            for (const vid of vids) stmt.run(vid.id, vid.title, vid.description, vid.url, vid.thumbnailUrl, vid.duration, vid.categoryId);
        })(videos);
        console.log('Videos migration successful.');
    } catch (e) {
        if (e instanceof Error && 'code' in e && e.code !== 'ENOENT') { console.error('Error migrating videos:', e);}
        else { console.log('No video data file to migrate.'); }
    }
  }

  // Check if patients table is empty
  const patientCount = db.prepare('SELECT COUNT(*) as count FROM patients').get() as { count: number };
  if (patientCount.count === 0) {
    console.log('Migrating patients...');
    const patientsPath = path.join(process.cwd(), 'src', 'data', 'patients.json');
    try {
        const data = await fs.readFile(patientsPath, 'utf-8');
        const patients: Patient[] = JSON.parse(data);
        const patientStmt = db.prepare('INSERT OR IGNORE INTO patients (id, name, email, avatarUrl, shareId) VALUES (?, ?, ?, ?, ?)');
        const exerciseStmt = db.prepare('INSERT OR IGNORE INTO assigned_exercises (patient_id, video_id, display_order) VALUES (?, ?, ?)');
        const activityStmt = db.prepare('INSERT OR IGNORE INTO activity_log (patient_id, date, activity) VALUES (?, ?, ?)');

        db.transaction((pats) => {
        for (const p of pats) {
            patientStmt.run(p.id, p.name, p.email, p.avatarUrl, p.shareId);
            if (p.assignedExercises) {
                for (const [index, exercise] of p.assignedExercises.entries()) {
                    exerciseStmt.run(p.id, exercise.videoId, index);
                }
            }
             if (p.activityLog) {
                for (const log of p.activityLog) {
                   activityStmt.run(p.id, log.date, log.activity);
                }
            }
        }
        })(patients);
        console.log('Patients migration successful.');
    } catch (e) {
       if (e instanceof Error && 'code' in e && e.code !== 'ENOENT') { console.error('Error migrating patients:', e);}
       else { console.log('No patient data file to migrate.'); }
    }
  }
   console.log('Data migration check complete.');
};

// --- Initial Setup ---
// Wrap async logic in a self-executing function
(async () => {
  try {
    createSchema();
    await migrateData();
  } catch (error) {
    console.error('Failed during initial database setup:', error);
  }
})();

// Export the database connection instance
export default db;
