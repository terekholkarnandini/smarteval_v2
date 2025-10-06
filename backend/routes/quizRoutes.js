import express from "express";
import multer from "multer";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse"); 
import Quiz from "../models/Quiz.js";
const router = express.Router();
const upload = multer({ dest: "uploads/" });


//default quiz creation
router.post("/", async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body, 
      { new: true, runValidators: true }
    );
    res.json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Quiz
router.delete("/:id", async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: "Quiz deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//parsing
router.post("/upload", upload.single("quizFile"), async (req, res) => {
  try {
    const file = req.file;
    let content = "";

    if (file.mimetype === "text/plain") {
      content = fs.readFileSync(file.path, "utf-8");
    } else if (file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(dataBuffer);
      content = pdfData.text;
    } else {
      return res.status(400).json({ error: "Only .txt or .pdf files are allowed" });
    }

    const questions = parseQuestions(content);

    const quiz = new Quiz({
      title: "Uploaded Quiz",
      description: "Auto-created from file",
      topic: "General",
      timeLimit: 10,
      questions,
    });

    await quiz.save();
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//logic
function parseQuestions(content) {
  const blocks = content.split("Q:").filter((b) => b.trim() !== "");
  return blocks.map((block) => {
    const lines = block.trim().split("\n").map((l) => l.trim());
    const questionText = lines[0];
    const options = lines.slice(1, 5).map((line) => line.replace(/^[A-D]\)/, "").trim());
    const answerLine = lines.find((l) => l.startsWith("Answer:"));
    const correctAnswer = answerLine ? "ABCD".indexOf(answerLine.split(":")[1].trim()) : 0;

    return { questionText, options, correctAnswer };
  });
}

export default router;
