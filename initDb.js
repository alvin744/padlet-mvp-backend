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

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, role)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(1, "Ms Tan", "teacher1@example.com", "teacher");
  stmt.run(2, "Alicia", "student1@example.com", "student");
  stmt.run(3, "Ben", "student2@example.com", "student");
  stmt.finalize();

  console.log("Database initialized.");
});