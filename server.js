// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true })); // To handle form-data
app.use(express.json());
app.use(cors());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// ✅ User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

// ✅ Signup Route
app.post("/signup", async (req, res) => {
  const { name, email, password, confirm } = req.body;

  // Server side validation
  if (!name || !email || !password || !confirm) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  if (password !== confirm) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already registered" });
  }

  // Hash password & save user
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  await newUser.save();
  return res.status(200).json({ message: "Account created successfully" });
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
