import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import quizRoutes from "./routes/quizRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/smarteval", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },   
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "faculty"], required: true },
   studentId: { type: String, unique: true, sparse: true }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// generation od s_id
async function generateUniqueStudentId() {
  let unique = false;
  let studentId = "";

  while (!unique) {
    // Random number between 100000 and 99999999 
    const randomNum = Math.floor(Math.random() * (99999999 - 100000 + 1)) + 100000;
    studentId = `STD${randomNum}`;

    // Check if it already exists
    const existing = await User.findOne({ studentId });
    if (!existing) unique = true;
  }

  return studentId;
}

// REGISTER ROUTE
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    //  Use the helper function to generate a unique student ID
    let studentId = undefined;
    if (role === "student") {
      studentId = await generateUniqueStudentId();
    }
 
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      studentId,
    });

    await user.save();

    res.json({
      message: "User registered successfully",
      studentId: user.studentId,
      user,
    });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(400).json({ error: err.message });
  }
});


// LOGIN ROUTE
app.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  const user = await User.findOne({ email, role });
  if (!user) return res.status(400).json({ error: "User not found" });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign(
    { id: user._id, role: user.role, name: user.name }, 
    "SECRET123",
    { expiresIn: "1h" }
  );

  res.json({ 
  message: "Login successful",
  token,
  user: { 
    id: user._id, 
    name: user.name, 
    role: user.role, 
    email: user.email,
    studentId: user.studentId || null
  }
});

});

app.use("/api/quizzes", quizRoutes);


app.use("/api/results", resultRoutes);


app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
