import mongoose, { Schema, Document } from 'mongoose';

export interface IParsedData {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  skills: string[];
  technicalSkills: string[];
  softSkills: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    year: string;
    grade?: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
    isCurrent: boolean;
  }>;
  internships: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
    startDate?: string;
    endDate?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year?: string;
    url?: string;
  }>;
  languages: string[];
  summary: string;
  isFresher: boolean;
}

export interface IResume extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  parsedData: IParsedData;
  summary: string;
  suggestions: string[];
  atsScore: number;
  atsFeedback: {
    strengths: string[];
    weaknesses: string[];
    overall: string;
  };
  isProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const parsedDataSchema = new Schema<IParsedData>(
  {
    name: String,
    email: String,
    phone: String,
    linkedin: String,
    portfolio: String,
    skills: [String],
    technicalSkills: [String],
    softSkills: [String],
    projects: [
      {
        name: String,
        description: String,
        technologies: [String],
        url: String,
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        field: String,
        year: String,
        grade: String,
      },
    ],
    experience: [
      {
        company: String,
        position: String,
        duration: String,
        description: String,
        isCurrent: Boolean,
      },
    ],
    internships: [
      {
        company: String,
        position: String,
        duration: String,
        description: String,
        startDate: String,
        endDate: String,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        year: String,
        url: String,
      },
    ],
    languages: [String],
    summary: String,
    isFresher: Boolean,
  },
  { _id: false }
);

const resumeSchema = new Schema<IResume>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    parsedData: {
      type: parsedDataSchema,
      default: {},
    },
    summary: {
      type: String,
    },
    suggestions: [String],
    atsScore: {
      type: Number,
      default: 0,
    },
    atsFeedback: {
      type: {
        strengths: [String],
        weaknesses: [String],
        overall: String,
      },
      default: { strengths: [], weaknesses: [], overall: '' },
    },
    isProcessed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

resumeSchema.index({ userId: 1 });
resumeSchema.index({ createdAt: -1 });

export const Resume = mongoose.model<IResume>('Resume', resumeSchema);
