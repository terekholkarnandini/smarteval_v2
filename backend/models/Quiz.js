import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  questionText: String,
  options: [String],
  correctAnswer: Number, // index of correct option
});

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  topic: String,
  timeLimit: Number, // in minutes
  questions: [QuestionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("Quiz", QuizSchema);
