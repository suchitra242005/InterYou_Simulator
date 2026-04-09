import { Interview, Feedback, Resume } from '../models/index.js';

export interface DashboardStats {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  totalPracticeTime: number;
  recentInterviews: Array<{
    id: string;
    company: string;
    role: string;
    score?: number;
    status: string;
    createdAt: Date;
  }>;
  skillBreakdown: Record<string, number>;
  progressTrend: Array<{
    date: string;
    score: number;
  }>;
}

export class DashboardService {
  async getStats(userId: string): Promise<DashboardStats> {
    const interviews = await Interview.find({ userId });
    const feedbacks = await Feedback.find({ userId });
    const resumes = await Resume.find({ userId });

    const completedInterviews = interviews.filter(i => i.status === 'completed');
    const totalPracticeTime = completedInterviews.reduce((sum, i) => sum + (i.totalDuration || 0), 0);

    const scores = feedbacks.map(f => f.overallScore);
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    const skillBreakdown = this.calculateSkillBreakdown(feedbacks);
    const progressTrend = this.calculateProgressTrend(feedbacks);

    const recentInterviews = interviews
      .slice(0, 5)
      .map(i => {
        const feedback = feedbacks.find(f => f.interviewId.toString() === i._id.toString());
        return {
          id: i._id.toString(),
          company: i.company,
          role: i.role,
          score: feedback?.overallScore,
          status: i.status,
          createdAt: i.createdAt,
        };
      });

    return {
      totalInterviews: interviews.length,
      completedInterviews: completedInterviews.length,
      averageScore,
      totalPracticeTime,
      recentInterviews,
      skillBreakdown,
      progressTrend,
    };
  }

  private calculateSkillBreakdown(feedbacks: Array<{
    behavioralAnalysis: { communicationSkills: number; problemSolving: number; leadership: number; teamwork: number; adaptability: number };
    technicalEvaluation: { technicalKnowledge: number; codeQuality: number; systemDesign: number; debugging: number };
  }>): Record<string, number> {
    if (feedbacks.length === 0) {
      return {
        communicationSkills: 0,
        problemSolving: 0,
        leadership: 0,
        teamwork: 0,
        adaptability: 0,
        technicalKnowledge: 0,
        codeQuality: 0,
        systemDesign: 0,
        debugging: 0,
      };
    }

    const sum = feedbacks.reduce(
      (acc, f) => ({
        communicationSkills: acc.communicationSkills + f.behavioralAnalysis.communicationSkills,
        problemSolving: acc.problemSolving + f.behavioralAnalysis.problemSolving,
        leadership: acc.leadership + f.behavioralAnalysis.leadership,
        teamwork: acc.teamwork + f.behavioralAnalysis.teamwork,
        adaptability: acc.adaptability + f.behavioralAnalysis.adaptability,
        technicalKnowledge: acc.technicalKnowledge + f.technicalEvaluation.technicalKnowledge,
        codeQuality: acc.codeQuality + f.technicalEvaluation.codeQuality,
        systemDesign: acc.systemDesign + f.technicalEvaluation.systemDesign,
        debugging: acc.debugging + f.technicalEvaluation.debugging,
      }),
      {
        communicationSkills: 0,
        problemSolving: 0,
        leadership: 0,
        teamwork: 0,
        adaptability: 0,
        technicalKnowledge: 0,
        codeQuality: 0,
        systemDesign: 0,
        debugging: 0,
      }
    );

    const count = feedbacks.length;
    return {
      communicationSkills: Math.round(sum.communicationSkills / count),
      problemSolving: Math.round(sum.problemSolving / count),
      leadership: Math.round(sum.leadership / count),
      teamwork: Math.round(sum.teamwork / count),
      adaptability: Math.round(sum.adaptability / count),
      technicalKnowledge: Math.round(sum.technicalKnowledge / count),
      codeQuality: Math.round(sum.codeQuality / count),
      systemDesign: Math.round(sum.systemDesign / count),
      debugging: Math.round(sum.debugging / count),
    };
  }

  private calculateProgressTrend(feedbacks: Array<{ generatedAt: Date; overallScore: number }>): Array<{ date: string; score: number }> {
    return feedbacks
      .sort((a, b) => new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime())
      .slice(-10)
      .map(f => ({
        date: new Date(f.generatedAt).toISOString().split('T')[0],
        score: f.overallScore,
      }));
  }
}

export const dashboardService = new DashboardService();
