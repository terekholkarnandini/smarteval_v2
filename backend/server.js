import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import quizRoutes from "./routes/quizRoutes.js";

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/smarteval", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error(err));


//  User Schema 

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },   
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "faculty"], required: true }
});

const User = mongoose.model("User", userSchema);


// Register
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
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
    message: " Login successful", 
    token, 
    user: { id: user._id, name: user.name, role: user.role }
  });
});

app.use("/api/quizzes", quizRoutes);

app.listen(5000, () => console.log(" Server running on http://localhost:5000"));
