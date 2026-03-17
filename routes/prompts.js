const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", (req, res) => {
  const { title, description, due_date, created_by } = req.body;

  if (!title || !created_by) {
    return res.status(400).json({ error: "title and created_by are required" });
  }

  const sql = `
    INSERT INTO prompts (title, description, due_date, created_by)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [title, description || "", due_date || null, created_by], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      message: "Prompt created successfully",
      promptId: this.lastID
    });
  });
});

router.get("/", (req, res) => {
  const sql = `
    SELECT
      p.*,
      u.name AS teacher_name
    FROM prompts p
    JOIN users u ON p.created_by = u.id
    ORDER BY p.id DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      p.*,
      u.name AS teacher_name
    FROM prompts p
    JOIN users u ON p.created_by = u.id
    WHERE p.id = ?
  `;

  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: "Prompt not found" });
    }

    res.json(row);
  });
});

router.get("/:id/responses", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      r.*,
      u.name AS student_name,
      u.email AS student_email
    FROM responses r
    JOIN users u ON r.student_id = u.id
    WHERE r.prompt_id = ?
    ORDER BY r.submitted_at DESC
  `;

  db.all(sql, [id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

module.exports = router;