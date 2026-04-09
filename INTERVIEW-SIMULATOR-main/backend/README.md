# InterYou Backend - AI-Powered Interview Platform

A secure, AI-powered backend for an end-to-end interview system featuring resume parsing, video interview analysis, and real-time performance feedback.

## Features

- **Secure Authentication**: JWT-based authentication with refresh tokens
- **Resume Parsing**: AI-powered resume extraction using Ollama
- **Video Interview**: Camera-enabled interview with real-time analysis
- **Speech Analysis**: Confidence, clarity, filler words, speaking speed
- **Facial Analysis**: Eye contact, expressions, attentiveness tracking
- **Adaptive Questions**: AI-generated dynamic interview questions
- **Performance Reports**: Comprehensive feedback with PDF export

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **AI**: Ollama (local LLM)
- **Real-time**: Socket.IO
- **Validation**: Zod
- **PDF Generation**: PDFKit

## Prerequisites

- Node.js 18+
- MongoDB 6+
- Ollama (for AI features)

### Installing Ollama

```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows - Download from https://ollama.com/download

# Pull a model
ollama pull llama3.2

# Start Ollama server
ollama serve
```

## Installation

```bash
cd backend
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ineryou
JWT_SECRET=your-secure-jwt-secret
JWT_REFRESH_SECRET=your-secure-refresh-secret
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
FRONTEND_URL=http://localhost:5173
```

## Running the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/profile` | Get user profile |
| PATCH | `/api/auth/profile` | Update profile |

### Resume
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resume/upload` | Upload resume |
| GET | `/api/resume` | List user resumes |
| GET | `/api/resume/:id` | Get resume details |
| POST | `/api/resume/:id/parse` | Parse resume with AI |
| PATCH | `/api/resume/:id` | Update parsed data |
| DELETE | `/api/resume/:id` | Delete resume |
| GET | `/api/resume/:id/report` | Download PDF report |

### Interview
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interview` | Create interview |
| GET | `/api/interview` | List interviews |
| GET | `/api/interview/:id` | Get interview details |
| POST | `/api/interview/:id/questions` | Generate AI questions |
| POST | `/api/interview/:id/start` | Start interview |
| POST | `/api/interview/:id/answer` | Submit answer |
| POST | `/api/interview/:id/complete` | Complete interview |
| GET | `/api/interview/:id/next-question` | Get next question |

### Feedback
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feedback` | List all feedback |
| POST | `/api/feedback/interview/:id/generate` | Generate feedback |
| GET | `/api/feedback/interview/:id` | Get feedback |
| GET | `/api/feedback/:id/report` | Download PDF report |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get user statistics |

## WebSocket Events

### Client → Server
- `authenticate` - Authenticate for interview
- `start-analysis` - Start real-time analysis
- `speech-data` - Send audio data for analysis
- `facial-data` - Send facial analysis data
- `end-interview` - End the interview

### Server → Client
- `authenticated` - Authentication result
- `analysis-started` - Analysis started
- `speech-analysis` - Speech analysis results
- `facial-analysis` - Facial analysis results
- `interview-ended` - Interview completed

## Example Usage

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "name": "John Doe"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Upload Resume
```bash
curl -X POST http://localhost:5000/api/resume/upload \
  -H "Authorization: Bearer <token>" \
  -F "resume=@resume.pdf"
```

## Project Structure

```
backend/
├── src/
│   ├── config/        # Configuration
│   ├── controllers/   # Route handlers
│   ├── middleware/    # Auth, validation, error handling
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   └── index.ts       # Entry point
├── uploads/           # Resume storage
└── package.json
```

## License

MIT
