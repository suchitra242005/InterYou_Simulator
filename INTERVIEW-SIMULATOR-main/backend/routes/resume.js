const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdf = require("pdf-parse");
const groq = require("groq-sdk");
const Resume = require("../models/Resume");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const groqClient = new groq.GROQ({ apiKey: process.env.GROQ_API_KEY });

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.post("/upload", authMiddleware, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const resume = new Resume({
      userId: req.user.id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      isProcessed: false
    });
    await resume.save();
    res.status(201).json({ message: "Resume uploaded", resume });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) return res.status(404).json({ error: "Resume not found" });
    res.json(resume);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/parse", authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) return res.status(404).json({ error: "Resume not found" });

    const pdfBuffer = fs.readFileSync(resume.filePath);
    const pdfData = await pdf(pdfBuffer);
    const resumeText = pdfData.text;

    const extractionPrompt = `You are a resume parser. Extract structured information from the resume below and return ONLY a valid JSON object with this exact structure (no additional text):

{
  "name": "full name or null if not found",
  "email": "email or null if not found",
  "phone": "phone number or null if not found",
  "skills": ["skill1", "skill2"] (max 15 skills, only technical/skills),
  "projects": [{"name": "project name", "description": "brief description"}] (max 5),
  "education": [{"degree": "degree", "institution": "university/college", "year": "year or null"}] (max 5),
  "experience": [{"title": "job title", "company": "company name", "duration": "duration like '2020-2023' or '2 years'", "description": "brief job description"}] (max 5),
  "summary": "2-3 sentence professional summary or null"
}

Resume text:
${resumeText}`;

    const completion = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: extractionPrompt }],
      temperature: 0.2,
      max_tokens: 2000
    });

    let parsedData;
    try {
      parsedData = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      const jsonMatch = completion.choices[0].message.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse LLM response as JSON");
      }
    }

    resume.parsedData = parsedData;
    resume.isProcessed = true;
    await resume.save();
    res.json({ message: "Resume parsed", resume });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!resume) return res.status(404).json({ error: "Resume not found" });
    res.json(resume);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!resume) return res.status(404).json({ error: "Resume not found" });
    res.json({ message: "Resume deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
