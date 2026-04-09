# INTERVIEW SIMULATOR

## About

**INTERVIEW SIMULATOR** is an AI-powered interview practice platform designed to help job seekers prepare for their dream interviews. The platform analyzes resumes, generates personalized interview questions, and provides comprehensive feedback to help users improve their interview skills.

### Key Highlights
- 🎯 **Personalized Questions** - AI generates interview questions based on your resume
- 📊 **Real-time Feedback** - Get instant analysis of your responses
- 🎥 **Video Practice** - Record and review your interview performance
- 🔒 **Secure & Private** - Your data is never shared
- 🚀 **AI-Powered** - Uses advanced LLMs for realistic interview experience

## Features

- **Resume Upload** - Upload your PDF resume for AI analysis
- **AI Resume Analysis** - Extract skills, experience, and education automatically
- **Video Interview Practice** - Answer AI-generated interview questions
- **Performance Analysis** - Get comprehensive feedback and scoring
- **Secure & Private** - Your data is encrypted and never shared

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── src/                    # Frontend source code
├── backend/                # Backend source code
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/        # Database models (MongoDB schemas)
│   │   │   ├── User.ts    # User schema
│   │   │   ├── Resume.ts  # Resume schema
│   │   │   ├── Interview.ts # Interview schema
│   │   │   └── Feedback.ts # Feedback schema
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic & AI services
│   │   └── config/         # Configuration
│   └── uploads/            # Uploaded files
├── dist/                   # Production build
└── public/                 # Static assets
```

## Database Models

### User Model
- Stores user information (name, email, password)
- Handles authentication and profile data
- Tracks user progress and statistics

### Resume Model
- Stores uploaded resume files
- Contains parsed resume data (skills, experience, education)
- Links to user profile

### Interview Model
- Stores interview sessions
- Contains questions and answers
- Tracks interview duration and status

### Feedback Model
- Stores AI-generated feedback
- Contains performance scores
- Links to interview sessions

## License

MIT
