import express from "express";
import Result from "../models/Result.js";

const router = express.Router();


// Save quiz + proctoring result
router.post("/", async (req, res) => {
  try {
    // Validate required fields
    const {
      studentId,
      studentName,
      quizId,
      quizTitle,
      score,
      totalQuestions,
      correctAnswers,
      tabSwitchCount,
      suspiciousActivity
    } = req.body;

    if (!studentId || !quizId || score === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newResult = new Result({
      studentId,
      studentName,
      quizId,
      quizTitle,
      score,
      totalQuestions,
      correctAnswers,
      tabSwitchCount,
      suspiciousActivity
    });

    await newResult.save();
    res.status(201).json({ message: "Result saved successfully", result: newResult });
  } catch (err) {
    console.error("❌ Error saving result:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const results = await Result.find({ studentId }).sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching student results:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

router.get("/quiz/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;
    const results = await Result.find({ quizId }).sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching quiz results:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

router.get("/check/:studentId/:quizId", async (req, res) => {
  try {
    const { studentId, quizId } = req.params;
    const attempt = await Result.findOne({ studentId, quizId });
    res.json({ attempted: !!attempt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
