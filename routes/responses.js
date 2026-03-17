const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", (req, res) => {
  const { prompt_id, student_id, content } = req.body;

  if (!prompt_id || !student_id || !content) {
    return res.status(400).json({
      error: "prompt_id, student_id, and content are required"
    });
  }

  const sql = `
    INSERT INTO responses (prompt_id, student_id, content)
    VALUES (?, ?, ?)
  `;

  db.run(sql, [prompt_id, student_id, content], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      message: "Response submitted successfully",
      responseId: this.lastID
    });
  });
});

router.get("/", (req, res) => {
  const sql = `
    SELECT
      r.*,
      p.title AS prompt_title,
      u.name AS student_name
    FROM responses r
    JOIN prompts p ON r.prompt_id = p.id
    JOIN users u ON r.student_id = u.id
    ORDER BY r.id DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

router.put("/:id/feedback", (req, res) => {
  const { id } = req.params;
  const { feedback } = req.body;

  const sql = `
    UPDATE responses
    SET feedback = ?, status = 'reviewed', reviewed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [feedback || "", id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Response not found" });
    }

    res.json({ message: "Feedback added successfully" });
  });
});

module.exports = router;