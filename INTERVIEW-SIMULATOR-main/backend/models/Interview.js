const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
  company: { type: String, required: true },
  role: { type: String, required: true },
  interviewType: { type: String, enum: ["technical", "behavioral", "mixed"], default: "mixed" },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  questionCount: { type: Number, default: 5 },
  questions: [{
    text: String,
    category: String,
    type: { type: String, enum: ["technical", "behavioral"] }
  }],
  answers: [{
    questionIndex: Number,
    answer: String,
    timestamp: Date
  }],
  status: { type: String, enum: ["created", "in_progress", "completed"], default: "created" },
  startTime: Date,
  endTime: Date,
  totalDuration: Number,
  currentQuestion: { type: Number, default: 0 },
  cameraVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Interview", interviewSchema);
