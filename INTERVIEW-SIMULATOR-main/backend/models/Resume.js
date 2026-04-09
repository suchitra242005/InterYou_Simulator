const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileName: { type: String, required: true },
  filePath: { type: String },
  isProcessed: { type: Boolean, default: false },
  parsedData: {
    name: String,
    email: String,
    phone: String,
    linkedin: String,
    portfolio: String,
    skills: [String],
    projects: [mongoose.Schema.Types.Mixed],
    education: [mongoose.Schema.Types.Mixed],
    experience: [mongoose.Schema.Types.Mixed],
    summary: String
  }
}, { timestamps: true });

module.exports = mongoose.model("Resume", resumeSchema);
