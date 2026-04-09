import mongoose, { Schema, Document } from 'mongoose';

export type InterviewType = 'technical' | 'behavioral' | 'mixed';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type InterviewStatus = 'created' | 'in_progress' | 'completed' | 'cancelled';

export interface IQuestion {
  text: string;
  category: string;
  type: 'technical' | 'behavioral' | 'coding' | 'case_study' | 'hr';
  expectedDuration: number;
  difficulty?: number;
  focus?: string;
}

export interface IAnswer {
  questionIndex: number;
  text: string;
  audioPath?: string;
  videoPath?: string;
  speechAnalysis?: {
    confidence: number;
    clarity: number;
    fillerWordCount: number;
    speakingSpeed: number;
    correctness: number;
  };
  facialAnalysis?: {
    eyeContact: number;
    expressions: Record<string, number>;
    attentiveness: number;
  };
  timestamp: Date;
}

export interface IInterview extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  interviewType: InterviewType;
  difficulty: DifficultyLevel;
  questionCount: number;
  questions: IQuestion[];
  answers: IAnswer[];
  status: InterviewStatus;
  cameraVerified: boolean;
  startedAt?: Date;
  completedAt?: Date;
  totalDuration?: number;
  createdAt: Date;
  updatedAt: Date;
}

const speechAnalysisSchema = new Schema(
  {
    confidence: { type: Number, min: 0, max: 100 },
    clarity: { type: Number, min: 0, max: 100 },
    fillerWordCount: { type: Number, default: 0 },
    speakingSpeed: { type: Number },
    correctness: { type: Number, min: 0, max: 100 },
  },
  { _id: false }
);

const facialAnalysisSchema = new Schema(
  {
    eyeContact: { type: Number, min: 0, max: 100 },
    expressions: { type: Map, of: Number },
    attentiveness: { type: Number, min: 0, max: 100 },
  },
  { _id: false }
);

const answerSchema = new Schema<IAnswer>(
  {
    questionIndex: { type: Number, required: true },
    text: { type: String },
    audioPath: { type: String },
    videoPath: { type: String },
    speechAnalysis: speechAnalysisSchema,
    facialAnalysis: facialAnalysisSchema,
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const questionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    category: { type: String, required: true },
    type: {
      type: String,
      enum: ['technical', 'behavioral'],
      required: true,
    },
    expectedDuration: { type: Number, default: 120 },
  },
  { _id: false }
);

const interviewSchema = new Schema<IInterview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    interviewType: {
      type: String,
      enum: ['technical', 'behavioral', 'mixed'],
      default: 'mixed',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    questionCount: {
      type: Number,
      default: 5,
      min: 1,
      max: 20,
    },
    questions: [questionSchema],
    answers: [answerSchema],
    status: {
      type: String,
      enum: ['created', 'in_progress', 'completed', 'cancelled'],
      default: 'created',
    },
    cameraVerified: {
      type: Boolean,
      default: false,
    },
    startedAt: Date,
    completedAt: Date,
    totalDuration: Number,
  },
  {
    timestamps: true,
  }
);

interviewSchema.index({ userId: 1, status: 1 });
interviewSchema.index({ createdAt: -1 });

export const Interview = mongoose.model<IInterview>('Interview', interviewSchema);
