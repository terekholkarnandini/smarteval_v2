import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  studentId: { type: String },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  quizTitle: String,
  score: Number,
  totalQuestions: Number,
  percentage: Number,
  correctAnswers: Number,
  tabSwitchCount: Number,
  suspiciousActivity: Boolean
}, { timestamps: true });


const Result = mongoose.model("Result", resultSchema);
export default Result;
