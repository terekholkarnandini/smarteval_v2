import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  name: { type: String, required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  quizTitle: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },

  // Proctoring data
  tabSwitchCount: { type: Number, default: 0 },
  suspiciousActivity: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

const Result = mongoose.model("Result", resultSchema);
export default Result;
