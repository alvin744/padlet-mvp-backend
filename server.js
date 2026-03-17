const express = require("express");
const cors = require("cors");

// initialize database on startup
require("./initDb");

const usersRouter = require("./routes/users");
const promptsRouter = require("./routes/prompts");
const responsesRouter = require("./routes/responses");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "padlet-mvp backend is running" });
});

app.use("/users", usersRouter);
app.use("/prompts", promptsRouter);
app.use("/responses", responsesRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});