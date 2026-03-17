const db = require("./db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK(role IN ('teacher', 'student'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      created_by INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prompt_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted', 'reviewed')),
      feedback TEXT,
      submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
      reviewed_at TEXT,
      FOREIGN KEY (prompt_id) REFERENCES prompts(id),
      FOREIGN KEY (student_id) REFERENCES users(id)
    )
  `);

  // Seed users
  const userStmt = db.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, role)
    VALUES (?, ?, ?, ?)
  `);

  userStmt.run(1, "Ms Tan", "teacher1@example.com", "teacher");
  userStmt.run(2, "Alicia", "student1@example.com", "student");
  userStmt.run(3, "Ben", "student2@example.com", "student");
  userStmt.finalize();

  // Seed prompts
  const promptStmt = db.prepare(`
    INSERT OR IGNORE INTO prompts (id, title, description, due_date, created_by)
    VALUES (?, ?, ?, ?, ?)
  `);

  promptStmt.run(
    1,
    "Share one idea about teamwork",
    "Write a short reflection and include one real example.",
    "2026-03-25",
    1
  );

  promptStmt.run(
    2,
    "What makes a good learning experience?",
    "Describe one class, workshop, or project that helped you learn effectively.",
    "2026-03-28",
    1
  );

  promptStmt.run(
    3,
    "How should teams handle blockers?",
    "Share one practical way a team can unblock work quickly.",
    "2026-03-30",
    1
  );

  promptStmt.finalize();

  // Seed responses
  const responseStmt = db.prepare(`
    INSERT OR IGNORE INTO responses
    (id, prompt_id, student_id, content, status, feedback, submitted_at, reviewed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  responseStmt.run(
    1,
    1,
    2,
    "A good team communicates clearly and makes it easy for people to ask for help when they are stuck.",
    "reviewed",
    "Strong point. Clear and practical example.",
    "2026-03-17 09:00:00",
    "2026-03-17 10:00:00"
  );

  responseStmt.run(
    2,
    1,
    3,
    "Teamwork improves when people understand their responsibilities and support one another during peak periods.",
    "submitted",
    null,
    "2026-03-17 09:30:00",
    null
  );

  responseStmt.run(
    3,
    2,
    2,
    "The best learning experiences are interactive and allow learners to apply ideas immediately through examples or small exercises.",
    "reviewed",
    "Nice observation. Good emphasis on active learning.",
    "2026-03-17 11:00:00",
    "2026-03-17 12:00:00"
  );

  responseStmt.run(
    4,
    3,
    3,
    "Teams can handle blockers better by surfacing them early during check-ins instead of waiting until deadlines are near.",
    "submitted",
    null,
    "2026-03-17 12:30:00",
    null
  );

  responseStmt.finalize();

  console.log("Database initialized with demo data.");
});