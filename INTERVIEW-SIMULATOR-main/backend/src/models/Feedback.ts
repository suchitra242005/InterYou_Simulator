import mongoose, { Schema, Document } from 'mongoose';

export interface IStrength {
  category: string;
  description: string;
  score: number;
}

export interface IWeakness {
  category: string;
  description: string;
  score: number;
  recommendation: string;
}

export interface IFeedback extends Document {
  _id: mongoose.Types.ObjectId;
  interviewId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  overallScore: number;
  technicalScore: number;
  behavioralScore: number;
  speechMetrics: {
    averageConfidence: number;
    averageClarity: number;
    totalFillerWords: number;
    averageSpeakingSpeed: number;
    averageCorrectness: number;
  };
  facialMetrics: {
    averageEyeContact: number;
    averageAttentiveness: number;
    expressionBreakdown: Record<string, number>;
  };
  strengths: IStrength[];
  weaknesses: IWeakness[];
  behavioralAnalysis: {
    communicationSkills: number;
    problemSolving: number;
    leadership: number;
    teamwork: number;
    adaptability: number;
  };
  technicalEvaluation: {
    technicalKnowledge: number;
    codeQuality: number;
    systemDesign: number;
    debugging: number;
  };
  overallFeedback: string;
  improvementAreas: string[];
  recommendedResources: string[];
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const strengthSchema = new Schema<IStrength>(
  {
    category: { type: String, required: true },
    description: { type: String, required: true },
    score: { type: Number, min: 0, max: 100 },
  },
  { _id: false }
);

const weaknessSchema = new Schema<IWeakness>(
  {
    category: { type: String, required: true },
    description: { type: String, required: true },
    score: { type: Number, min: 0, max: 100 },
    recommendation: { type: String, required: true },
  },
  { _id: false }
);

const behavioralAnalysisSchema = new Schema(
  {
    communicationSkills: { type: Number, min: 0, max: 100 },
    problemSolving: { type: Number, min: 0, max: 100 },
    leadership: { type: Number, min: 0, max: 100 },
    teamwork: { type: Number, min: 0, max: 100 },
    adaptability: { type: Number, min: 0, max: 100 },
  },
  { _id: false }
);

const technicalEvaluationSchema = new Schema(
  {
    technicalKnowledge: { type: Number, min: 0, max: 100 },
    codeQuality: { type: Number, min: 0, max: 100 },
    systemDesign: { type: Number, min: 0, max: 100 },
    debugging: { type: Number, min: 0, max: 100 },
  },
  { _id: false }
);

const feedbackSchema = new Schema<IFeedback>(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    technicalScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    behavioralScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    speechMetrics: {
      averageConfidence: { type: Number, min: 0, max: 100 },
      averageClarity: { type: Number, min: 0, max: 100 },
      totalFillerWords: { type: Number, default: 0 },
      averageSpeakingSpeed: { type: Number },
      averageCorrectness: { type: Number, min: 0, max: 100 },
    },
    facialMetrics: {
      averageEyeContact: { type: Number, min: 0, max: 100 },
      averageAttentiveness: { type: Number, min: 0, max: 100 },
      expressionBreakdown: { type: Map, of: Number },
    },
    strengths: [strengthSchema],
    weaknesses: [weaknessSchema],
    behavioralAnalysis: behavioralAnalysisSchema,
    technicalEvaluation: technicalEvaluationSchema,
    overallFeedback: {
      type: String,
      required: true,
    },
    improvementAreas: [String],
    recommendedResources: [String],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ interviewId: 1 });
feedbackSchema.index({ userId: 1, generatedAt: -1 });

export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema);
