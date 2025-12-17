
import db from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

function seed() {
  try {
    console.log('Seeding database...');

    // Drop existing tables to start fresh
    db.exec('DROP TABLE IF EXISTS activity_log');
    db.exec('DROP TABLE IF EXISTS assigned_exercises');
    db.exec('DROP TABLE IF EXISTS template_exercises'); // New table
    db.exec('DROP TABLE IF EXISTS program_templates'); // New table
    db.exec('DROP TABLE IF EXISTS video_categories');
    db.exec('DROP TABLE IF EXISTS videos');
    db.exec('DROP TABLE IF EXISTS patients');
    console.log('Dropped existing tables.');

    // Create tables with new template-related tables
    db.exec(`
      CREATE TABLE patients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        avatarUrl TEXT,
        shareId TEXT NOT NULL UNIQUE
      );

      CREATE TABLE videos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        url TEXT NOT NULL,
        thumbnailUrl TEXT,
        duration TEXT,
        categoryId TEXT,
        FOREIGN KEY (categoryId) REFERENCES video_categories(id) ON DELETE SET NULL
      );

      CREATE TABLE video_categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE
      );
      
      CREATE TABLE assigned_exercises (
        patient_id TEXT NOT NULL,
        video_id TEXT NOT NULL,
        display_order INTEGER NOT NULL,
        PRIMARY KEY (patient_id, video_id),
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
      );

      CREATE TABLE activity_log (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        date TEXT NOT NULL,
        activity_type TEXT NOT NULL,
        details TEXT,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      );
      
      CREATE TABLE program_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
      );

      CREATE TABLE template_exercises (
        template_id TEXT NOT NULL,
        video_id TEXT NOT NULL,
        display_order INTEGER NOT NULL,
        PRIMARY KEY (template_id, video_id),
        FOREIGN KEY (template_id) REFERENCES program_templates(id) ON DELETE CASCADE,
        FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
      );
    `);
    console.log('Created new tables with templates support.');

    // --- SEED DATA ---
    const findImage = (name: string) => `/images/seed/${name}.jpg`;

    // Seed Categories
    const categoriesToSeed = [
        { id: uuidv4(), name: 'Позвоночник' },
        { id: uuidv4(), name: 'Ноги' },
        { id: uuidv4(), name: 'Руки' },
        { id: uuidv4(), name: 'Шея' },
    ];
    const categoryStmt = db.prepare('INSERT INTO video_categories (id, name) VALUES (?, ?)');
    categoriesToSeed.forEach(cat => categoryStmt.run(cat.id, cat.name));
    console.log(`Seeded ${categoriesToSeed.length} categories.`);
    
    const getCatId = (name: string) => categoriesToSeed.find(c => c.name === name)?.id;

    // Seed Videos
    const videosToSeed = [
      { id: uuidv4(), title: 'Наклоны таза', description: 'Укрепление мышц кора.', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: findImage('video-1'), duration: '3:45', categoryId: getCatId('Позвоночник') },
      { id: uuidv4(), title: 'Мостик', description: 'Укрепление ягодичных мышц.', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: findImage('video-2'), duration: '5:10', categoryId: getCatId('Позвоночник') },
      { id: uuidv4(), title: 'Кошка-Корова', description: 'Улучшение гибкости позвоночника.', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: findImage('video-3'), duration: '4:20', categoryId: getCatId('Позвоночник') },
      { id: uuidv4(), title: 'Сгибание колена к груди', description: 'Растяжка нижней части спины.', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: findImage('video-4'), duration: '6:00', categoryId: getCatId('Ноги') },
      { id: uuidv4(), title: 'Подъемы на носки', description: 'Укрепление икроножных мышц.', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: findImage('video-5'), duration: '2:30', categoryId: getCatId('Ноги') },
      { id: uuidv4(), title: 'Махи руками', description: 'Развитие подвижности плеч.', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: findImage('video-6'), duration: '3:00', categoryId: getCatId('Руки') },
    ];
    const videoStmt = db.prepare('INSERT INTO videos (id, title, description, url, thumbnailUrl, duration, categoryId) VALUES (?, ?, ?, ?, ?, ?, ?)');
    videosToSeed.forEach(vid => videoStmt.run(vid.id, vid.title, vid.description, vid.url, vid.thumbnailUrl, vid.duration, vid.categoryId));
    console.log(`Seeded ${videosToSeed.length} videos.`);

    // Seed Patients
    const patientsToSeed = [
      { id: uuidv4(), name: 'Иван Петров', email: 'ivan.petrov@example.com' },
      { id: uuidv4(), name: 'Мария Сидорова', email: 'maria.sidorova@example.com' },
      { id: uuidv4(), name: 'Алексей Иванов', email: 'alexey.ivanov@example.com' },
    ];
    const patientStmt = db.prepare('INSERT INTO patients (id, name, email, avatarUrl, shareId) VALUES (?, ?, ?, ?, ?)');
    patientsToSeed.forEach(p => {
        const avatarUrl = `https://avatar.vercel.sh/${p.email}.png`;
        const shareId = `share-${uuidv4()}`;
        patientStmt.run(p.id, p.name, p.email, avatarUrl, shareId);
    });
    console.log(`Seeded ${patientsToSeed.length} patients.`);

    // Seed Assigned Exercises
    const assignmentsToSeed = [
      { patientId: patientsToSeed[0].id, videoId: videosToSeed[0].id, order: 0 },
      { patientId: patientsToSeed[0].id, videoId: videosToSeed[1].id, order: 1 },
      { patientId: patientsToSeed[1].id, videoId: videosToSeed[2].id, order: 0 },
    ];
    const assignedStmt = db.prepare('INSERT INTO assigned_exercises (patient_id, video_id, display_order) VALUES (?, ?, ?)');
    assignmentsToSeed.forEach(a => assignedStmt.run(a.patientId, a.videoId, a.order));
    console.log(`Seeded ${assignmentsToSeed.length} exercise assignments.`);
    
    // Seed Program Templates
    const templatesToSeed = [
        { id: uuidv4(), name: 'Здоровая спина', description: 'Базовый комплекс для укрепления спины.' },
        { id: uuidv4(), name: 'Легкие ноги', description: 'Упражнения для снятия усталости ног.' },
    ];
    const templateStmt = db.prepare('INSERT INTO program_templates (id, name, description) VALUES (?, ?, ?)');
    templatesToSeed.forEach(t => templateStmt.run(t.id, t.name, t.description));
    console.log(`Seeded ${templatesToSeed.length} program templates.`);

    // Seed Template Exercises
    const templateExercisesToSeed = [
        { templateId: templatesToSeed[0].id, videoId: videosToSeed[0].id, order: 0 },
        { templateId: templatesToSeed[0].id, videoId: videosToSeed[1].id, order: 1 },
        { templateId: templatesToSeed[0].id, videoId: videosToSeed[2].id, order: 2 },
        { templateId: templatesToSeed[1].id, videoId: videosToSeed[3].id, order: 0 },
        { templateId: templatesToSeed[1].id, videoId: videosToSeed[4].id, order: 1 },
    ];
    const templateExStmt = db.prepare('INSERT INTO template_exercises (template_id, video_id, display_order) VALUES (?, ?, ?)');
    templateExercisesToSeed.forEach(te => templateExStmt.run(te.templateId, te.videoId, te.order));
    console.log(`Seeded ${templateExercisesToSeed.length} template exercises.`);

    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Check if the database file exists. If not, seed it.
try {
  const fileInfo = db.prepare("PRAGMA database_list;").get();
  // if file is empty, it will be 0 bytes
  if (fileInfo && fileInfo.name === 'main' && db.pragma('page_count').get().page_count === 0) {
     seed();
  }
} catch (error) {
    // This might fail if the file doesn't exist, which is fine.
    seed();
}
