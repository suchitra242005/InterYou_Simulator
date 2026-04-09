const express = require("express");
const jwt = require("jsonwebtoken");
const Interview = require("../models/Interview");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token, authorization denied" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
};

const sampleQuestions = [
  { text: "Tell me about yourself", category: "behavioral", type: "behavioral" },
  { text: "What are your strengths and weaknesses?", category: "behavioral", type: "behavioral" },
  { text: "Describe a challenging project you worked on", category: "behavioral", type: "behavioral" },
  { text: "Explain a technical concept to someone non-technical", category: "technical", type: "technical" },
  { text: "How do you handle stress and tight deadlines?", category: "behavioral", type: "behavioral" }
];

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { resumeId, company, role, interviewType, difficulty, questionCount } = req.body;
    const interview = new Interview({
      userId: req.user.id,
      resumeId,
      company,
      role,
      interviewType: interviewType || "mixed",
      difficulty: difficulty || "medium",
      questionCount: questionCount || 5,
      questions: sampleQuestions.slice(0, questionCount || 5),
      status: "created"
    });
    await interview.save();
    res.status(201).json({ message: "Interview created", interview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { userId: req.user.id };
    if (status) query.status = status;
    const interviews = await Interview.find(query).sort({ createdAt: -1 });
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id });
    if (!interview) return res.status(404).json({ error: "Interview not found" });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/questions", authMiddleware, async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id });
    if (!interview) return res.status(404).json({ error: "Interview not found" });
    res.json({ questions: interview.questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/start", authMiddleware, async (req, res) => {
  try {
    const { cameraVerified } = req.body;
    const interview = await Interview.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: "in_progress", startTime: new Date(), cameraVerified },
      { new: true }
    );
    if (!interview) return res.status(404).json({ error: "Interview not found" });
    res.json({ message: "Interview started", interview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/answer", authMiddleware, async (req, res) => {
  try {
    const { questionIndex, answer } = req.body;
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id });
    if (!interview) return res.status(404).json({ error: "Interview not found" });
    if (!interview.answers) interview.answers = [];
    interview.answers.push({ questionIndex, answer, timestamp: new Date() });
    interview.currentQuestion = questionIndex + 1;
    await interview.save();
    res.json({ message: "Answer recorded", interview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/complete", authMiddleware, async (req, res) => {
  try {
    const interview = await Interview.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: "completed", endTime: new Date(), totalDuration: 900 },
      { new: true }
    );
    if (!interview) return res.status(404).json({ error: "Interview not found" });
    res.json({ message: "Interview completed", interview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/next-question", authMiddleware, async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id });
    if (!interview) return res.status(404).json({ error: "Interview not found" });
    const nextIndex = interview.currentQuestion || 0;
    const nextQuestion = interview.questions[nextIndex] || null;
    res.json(nextQuestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/adaptive-question", authMiddleware, async (req, res) => {
  try {
    const { previousAnswer } = req.body;
    const adaptiveQ = {
      text: "Based on your previous answer, can you elaborate more on your experience?",
      category: "behavioral",
      type: "behavioral"
    };
    res.json(adaptiveQ);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
