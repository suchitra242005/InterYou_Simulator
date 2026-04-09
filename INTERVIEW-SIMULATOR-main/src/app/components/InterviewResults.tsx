import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Download,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  BarChart3,
  Star,
  Award,
  ChevronLeft,
  Eye,
  MessageSquare,
  Code,
  Clock,
  Users,
  Zap,
  Brain,
  BookOpen,
  Calendar,
  Briefcase,
  GraduationCap,
  Activity,
  PieChart,
  LineChart,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  FileText,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Interview } from '../services/api';

interface QuestionFeedback {
  question: string;
  questionType: string;
  category: string;
  questionId?: string;
  answer: string;
  difficulty?: number;
  answerQuality?: string;
  correctness: number;
  confidence: number;
  clarity: number;
  eyeContact: number;
  bodyLanguage: number;
  overallScore: number;
  feedback: string;
  suggestions: string[];
  sampleAnswer?: string;
  timestamp?: string;
}

interface InterviewResultsProps {
  onBack: () => void;
  onLogout?: () => void;
  interview?: Interview | null;
  feedbackData?: {
    questions: QuestionFeedback[];
    correctness: number;
    confidence: number;
    clarity: number;
    eyeContact: number;
    bodyLanguage: number;
  };
  performanceHistory?: number[];
}

interface GraphData {
  content_scores: number[];
  confidence_scores: number[];
  communication_scores: number[];
  facial_scores: number[];
}

interface FinalReport {
  overall_score: number;
  level: string;
  summary: string;
  graph_data: GraphData;
  question_analysis: Array<{
    question: string;
    answer_summary: string;
    score: number;
    mistakes: string[];
    correct_approach: string;
    improvement_tip: string;
  }>;
  strengths: string[];
  weaknesses: string[];
  improvement_plan: string[];
}

export function InterviewResults({ onBack, onLogout, interview, feedbackData, performanceHistory = [] }: InterviewResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'analysis' | 'report'>('overview');
  
  const questionFeedback: QuestionFeedback[] = feedbackData?.questions || [];
  
  const analysis = useMemo(() => {
    const scores = questionFeedback.map(q => q.overallScore);
    const correctnessScores = questionFeedback.map(q => q.correctness);
    const confidenceScores = questionFeedback.map(q => q.confidence);
    const clarityScores = questionFeedback.map(q => q.clarity);
    const eyeContactScores = questionFeedback.map(q => q.eyeContact);
    const bodyLanguageScores = questionFeedback.map(q => q.bodyLanguage);
    
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 72;
    const avgCorrectness = correctnessScores.length > 0 ? Math.round(correctnessScores.reduce((a, b) => a + b, 0) / correctnessScores.length) : 65;
    const avgConfidence = confidenceScores.length > 0 ? Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length) : 70;
    const avgClarity = clarityScores.length > 0 ? Math.round(clarityScores.reduce((a, b) => a + b, 0) / clarityScores.length) : 68;
    const avgEyeContact = eyeContactScores.length > 0 ? Math.round(eyeContactScores.reduce((a, b) => a + b, 0) / eyeContactScores.length) : 75;
    const avgBodyLanguage = bodyLanguageScores.length > 0 ? Math.round(bodyLanguageScores.reduce((a, b) => a + b, 0) / bodyLanguageScores.length) : 75;
    
    const questionTypes = questionFeedback.reduce((acc, q) => {
      acc[q.questionType] = (acc[q.questionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const avgByType = Object.entries(questionTypes).map(([type, count]) => {
      const typeScores = questionFeedback.filter(q => q.questionType === type);
      const avg = typeScores.length > 0 
        ? Math.round(typeScores.reduce((a, b) => a + b.overallScore, 0) / typeScores.length)
        : 0;
      return { type, count, avg };
    });
    
    const performanceTrend = scores.length > 1 
      ? scores[scores.length - 1] - scores[0]
      : 0;
    
    const technicalSkillsEval = avgCorrectness >= 70 ? 'Strong' : avgCorrectness >= 50 ? 'Moderate' : 'Needs Improvement';
    const communicationSkillsEval = (avgConfidence + avgClarity) / 2 >= 70 ? 'Good' : (avgConfidence + avgClarity) / 2 >= 50 ? 'Fair' : 'Needs Work';
    const confidenceAnalysis = avgConfidence >= 75 ? 'High confidence demonstrated' : avgConfidence >= 50 ? 'Moderate confidence, room for improvement' : 'Low confidence, recommend practice';
    const behavioralAnalysis = (avgEyeContact + avgBodyLanguage) / 2 >= 70 ? 'Professional demeanor maintained' : 'Work on body language and eye contact';
    
    return {
      avgScore,
      avgCorrectness,
      avgConfidence,
      avgClarity,
      avgEyeContact,
      avgBodyLanguage,
      questionTypes,
      avgByType,
      performanceTrend,
      totalQuestions: questionFeedback.length,
      technicalSkillsEval,
      communicationSkillsEval,
      confidenceAnalysis,
      behavioralAnalysis
    };
  }, [questionFeedback]);

  const graphData: GraphData = {
    content_scores: questionFeedback.map(q => q.correctness),
    confidence_scores: questionFeedback.map(q => q.confidence),
    communication_scores: questionFeedback.map(q => q.clarity),
    facial_scores: questionFeedback.map(q => (q.eyeContact + q.bodyLanguage) / 2)
  };

  const finalReport: FinalReport = {
    overall_score: analysis.avgScore,
    level: analysis.avgScore >= 80 ? 'Advanced' : analysis.avgScore >= 60 ? 'Intermediate' : 'Beginner',
    summary: `The candidate demonstrated ${analysis.avgScore >= 70 ? 'good' : analysis.avgScore >= 50 ? 'moderate' : 'limited'} performance across ${analysis.totalQuestions} questions. ${analysis.performanceTrend >= 0 ? 'Performance improved' : 'Performance declined'} throughout the interview. Key areas to focus on include ${analysis.avgConfidence < 70 ? 'confidence building' : 'maintaining consistency'} and ${analysis.avgEyeContact < 70 ? 'eye contact improvement' : 'body language refinement'}.`,
    graph_data: graphData,
    question_analysis: questionFeedback.map(q => ({
      question: q.question,
      answer_summary: q.answer.substring(0, 150) + (q.answer.length > 150 ? '...' : ''),
      score: q.overallScore,
      mistakes: q.overallScore < 70 ? [
        q.correctness < 70 ? 'Incomplete or inaccurate answer' : null,
        q.confidence < 60 ? 'Lack of confidence in delivery' : null,
        q.clarity < 60 ? 'Poorly structured response' : null,
        q.eyeContact < 60 ? 'Insufficient eye contact' : null
      ].filter(Boolean) as string[] : [],
      correct_approach: q.sampleAnswer || 'Use STAR method with specific examples and quantifiable results',
      improvement_tip: q.suggestions[0] || 'Practice similar questions and maintain consistent confidence'
    })),
    strengths: [
      analysis.avgCorrectness >= 70 ? 'Strong technical accuracy in responses' : null,
      analysis.avgConfidence >= 70 ? 'Confident delivery throughout the interview' : null,
      analysis.avgClarity >= 70 ? 'Clear and well-structured answers' : null,
      analysis.avgEyeContact >= 70 ? 'Good eye contact with camera' : null,
      analysis.performanceTrend > 0 ? 'Consistent improvement across questions' : null,
      questionFeedback.some(q => q.answerQuality === 'excellent') ? 'Delivered excellent answers to some questions' : null
    ].filter(Boolean) as string[],
    weaknesses: [
      analysis.avgCorrectness < 70 ? 'Technical accuracy needs improvement' : null,
      analysis.avgConfidence < 70 ? 'Confidence level could be higher' : null,
      analysis.avgClarity < 70 ? 'Answer clarity and structure need work' : null,
      analysis.avgEyeContact < 70 ? 'Eye contact inconsistent' : null,
      analysis.performanceTrend < 0 ? 'Performance declined as interview progressed' : null
    ].filter(Boolean) as string[],
    improvement_plan: [
      'Practice STAR method for behavioral questions daily (15-20 minutes)',
      'Record yourself answering common interview questions and review',
      'Work on reducing filler words (um, uh, like) - aim for <5 per answer',
      'Maintain eye contact with camera for 80%+ of your answers',
      'Research and prepare 5-7 detailed project stories with metrics',
      'Practice speaking at a moderate pace - not too fast or slow',
      'Prepare concise 30-second and 2-minute introduction versions',
      'Practice mock interviews at least 3 times per week'
    ]
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    let yPos = 0;

    type RGB = readonly [number, number, number];

    const colors: Record<string, RGB> = {
      primary: [13, 148, 136],
      primaryDark: [8, 120, 112],
      success: [16, 185, 129],
      warning: [234, 179, 8],
      danger: [239, 68, 68],
      dark: [30, 41, 59],
      gray: [100, 116, 139],
      light: [248, 250, 252],
      border: [226, 232, 240]
    };

    const getScoreColor = (score: number): RGB => {
      if (score >= 80) return colors.success;
      if (score >= 60) return colors.warning;
      return colors.danger;
    };

    const getRating = (score: number): string => {
      if (score >= 80) return 'Excellent';
      if (score >= 70) return 'Good';
      if (score >= 60) return 'Fair';
      return 'Needs Work';
    };

    // Helper functions for jsPDF color methods
    const setFill = (color: RGB) => doc.setFillColor(color[0], color[1], color[2]);
    const setDraw = (color: RGB) => doc.setDrawColor(color[0], color[1], color[2]);
    const setText = (color: RGB) => doc.setTextColor(color[0], color[1], color[2]);

    // ========== PAGE 1: Header & Overview ==========
    yPos = 0;
    
    // Header background
    doc.setFillColor(setFill(colors.primary));
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Logo area
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 12, 12, 12, 2, 2, 'F');
    doc.setFillColor(setFill(colors.primary));
    doc.roundedRect(margin + 2, 14, 3, 8, 1, 1, 'F');
    doc.roundedRect(margin + 6, 14, 3, 8, 1, 1, 'F');
    
    // Title
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('InterYou', margin + 18, 20);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Interview Performance Report', margin + 18, 30);
    
    // Date on right
    doc.setFontSize(10);
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - margin, 20, { align: 'right' });
    
    if (interview) {
      doc.setFontSize(11);
      doc.text(`${interview.role} @ ${interview.company}`, pageWidth - margin, 30, { align: 'right' });
    }

    // ========== Score Section ==========
    yPos = 60;
    
    // White card background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(// @ts-ignore - jsPDF color methods accept spread arrays
...colors.border);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 45, 3, 3, 'FD');
    
    // Score circle (simplified as rectangle)
    const scoreColor = getScoreColor(analysis.avgScore);
    doc.setFillColor(...scoreColor);
    doc.roundedRect(margin + 5, yPos + 5, 35, 35, 2, 2, 'F');
    
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`${analysis.avgScore}`, margin + 22, yPos + 25, { align: 'center' });
    doc.setFontSize(10);
    doc.text('OUT OF 100', margin + 22, yPos + 33, { align: 'center' });
    
    // Level badge
    doc.setFillColor(doc.setFillColor(setFill(colors.primary)));
    doc.roundedRect(margin + 45, yPos + 5, 30, 10, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(finalReport.level.toUpperCase(), margin + 60, yPos + 12, { align: 'center' });
    
    // Summary text
    doc.setFontSize(10);
    doc.setTextColor(...colors.dark);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(finalReport.summary, pageWidth - margin - 110);
    doc.text(summaryLines, margin + 45, yPos + 22);
    
    // Trend indicator
    const trendValue = analysis.performanceTrend;
    const trendColor = trendValue >= 0 ? colors.success : colors.danger;
    doc.setFillColor(...trendColor);
    doc.roundedRect(margin + 45, yPos + 35, 35, 8, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(trendValue >= 0 ? `↑ +${trendValue}% trend` : `↓ ${trendValue}% trend`, margin + 62, yPos + 40, { align: 'center' });

    // ========== Metrics Grid ==========
    yPos = 115;
    
    const metrics = [
      { label: 'Correctness', score: analysis.avgCorrectness },
      { label: 'Confidence', score: analysis.avgConfidence },
      { label: 'Clarity', score: analysis.avgClarity },
      { label: 'Eye Contact', score: analysis.avgEyeContact },
      { label: 'Body Language', score: analysis.avgBodyLanguage }
    ];
    
    const cardWidth = (pageWidth - 2 * margin - 20) / 5;
    
    metrics.forEach((metric, i) => {
      const x = margin + i * (cardWidth + 5);
      
      // Card background
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(// @ts-ignore - jsPDF color methods accept spread arrays
...colors.border);
      doc.roundedRect(x, yPos, cardWidth, 40, 2, 2, 'FD');
      
      // Score bar background
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(x + 3, yPos + 25, cardWidth - 6, 6, 1, 1, 'F');
      
      // Score bar fill
      const metricColor = getScoreColor(metric.score);
      doc.setFillColor(...metricColor);
      doc.roundedRect(x + 3, yPos + 25, (cardWidth - 6) * (metric.score / 100), 6, 1, 1, 'F');
      
      // Label
      doc.setFontSize(8);
      doc.setTextColor(...colors.gray);
      doc.setFont('helvetica', 'normal');
      doc.text(metric.label, x + cardWidth / 2, yPos + 8, { align: 'center' });
      
      // Score
      doc.setFontSize(16);
      doc.setTextColor(...colors.dark);
      doc.setFont('helvetica', 'bold');
      doc.text(`${metric.score}`, x + cardWidth / 2, yPos + 20, { align: 'center' });
      
      // Rating
      doc.setFontSize(7);
      doc.setTextColor(...metricColor);
      doc.text(getRating(metric.score), x + cardWidth / 2, yPos + 36, { align: 'center' });
    });

    // ========== Question Analysis ==========
    yPos = 165;
    
    // Section header
    doc.setFillColor(doc.setFillColor(setFill(colors.primary)));
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 8, 1, 1, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('QUESTION-BY-QUESTION ANALYSIS', margin + 3, yPos + 5.5);
    
    yPos += 15;
    
    questionFeedback.slice(0, 4).forEach((q, index) => {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      
      // Question card
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(// @ts-ignore - jsPDF color methods accept spread arrays
...colors.border);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 35, 2, 2, 'FD');
      
      // Question number badge
      doc.setFillColor(doc.setFillColor(setFill(colors.primary)));
      doc.roundedRect(margin + 3, yPos + 3, 10, 10, 1, 1, 'F');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(`Q${index + 1}`, margin + 8, yPos + 9, { align: 'center' });
      
      // Question type tag
      const typeColor = q.questionType === 'technical' ? [59, 130, 246] as RGB : q.questionType === 'behavioral' ? [16, 185, 129] as RGB : [147, 51, 234] as RGB;
      // @ts-ignore - jsPDF accepts spread array
      doc.setFillColor(...typeColor);
      doc.roundedRect(margin + 16, yPos + 3, 22, 8, 1, 1, 'F');
      doc.setFontSize(6);
      doc.text(q.questionType.toUpperCase(), margin + 27, yPos + 8, { align: 'center' });
      
      // Score
      const qScoreColor = getScoreColor(q.overallScore);
      doc.setFontSize(14);
      doc.setTextColor(...qScoreColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${q.overallScore}`, pageWidth - margin - 20, yPos + 12);
      doc.setFontSize(8);
      doc.setTextColor(...colors.gray);
      doc.text('/100', pageWidth - margin - 5, yPos + 8);
      
      // Question text
      doc.setFontSize(8);
      doc.setTextColor(...colors.dark);
      doc.setFont('helvetica', 'normal');
      const qText = q.question.length > 80 ? q.question.substring(0, 80) + '...' : q.question;
      doc.text(qText, margin + 3, yPos + 20);
      
      // Answer preview
      doc.setTextColor(...colors.gray);
      const aText = q.answer.length > 100 ? q.answer.substring(0, 100) + '...' : q.answer;
      doc.text(aText, margin + 3, yPos + 27);
      
      yPos += 40;
    });

    // ========== PAGE 2: Strengths & Improvements ==========
    doc.addPage();
    yPos = 20;
    
    // Left column - Strengths
    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(...colors.success);
    doc.roundedRect(margin, yPos, (pageWidth - 2 * margin - 10) / 2, 90, 3, 3, 'FD');
    
    doc.setFontSize(12);
    doc.setTextColor(...colors.success);
    doc.setFont('helvetica', 'bold');
    doc.text('✓ KEY STRENGTHS', margin + 5, yPos + 10);
    
    doc.setFontSize(9);
    doc.setTextColor(...colors.dark);
    doc.setFont('helvetica', 'normal');
    
    let strengthY = yPos + 18;
    finalReport.strengths.slice(0, 4).forEach((strength, i) => {
      doc.text(`• ${strength}`, margin + 5, strengthY);
      strengthY += 8;
    });
    
    // Right column - Weaknesses
    doc.setFillColor(254, 252, 232);
    doc.setDrawColor(...colors.warning);
    doc.roundedRect(margin + (pageWidth - 2 * margin) / 2 + 5, yPos, (pageWidth - 2 * margin - 10) / 2, 90, 3, 3, 'FD');
    
    doc.setFontSize(12);
    doc.setTextColor(180, 83, 9);
    doc.setFont('helvetica', 'bold');
    doc.text('⚠ AREAS TO IMPROVE', margin + (pageWidth - 2 * margin) / 2 + 10, yPos + 10);
    
    doc.setFontSize(9);
    doc.setTextColor(...colors.dark);
    doc.setFont('helvetica', 'normal');
    
    let weaknessY = yPos + 18;
    finalReport.weaknesses.slice(0, 4).forEach((weakness, i) => {
      doc.text(`• ${weakness}`, margin + (pageWidth - 2 * margin) / 2 + 10, weaknessY);
      weaknessY += 8;
    });
    
    // ========== Improvement Plan ==========
    yPos = 125;
    
    doc.setFillColor(250, 245, 255);
    doc.setDrawColor(147, 51, 234);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 85, 3, 3, 'FD');
    
    doc.setFontSize(12);
    doc.setTextColor(126, 34, 206);
    doc.setFont('helvetica', 'bold');
    doc.text('📋 IMPROVEMENT PLAN', margin + 5, yPos + 10);
    
    doc.setFontSize(9);
    doc.setTextColor(...colors.dark);
    doc.setFont('helvetica', 'normal');
    
    let planY = yPos + 20;
    finalReport.improvement_plan.slice(0, 6).forEach((plan, i) => {
      doc.text(`${i + 1}. ${plan}`, margin + 5, planY);
      planY += 10;
    });
    
    // ========== Graph Data Section ==========
    yPos = 220;
    
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(// @ts-ignore - jsPDF color methods accept spread arrays
...colors.border);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 35, 2, 2, 'FD');
    
    doc.setFontSize(10);
    doc.setTextColor(...colors.dark);
    doc.setFont('helvetica', 'bold');
    doc.text('SCORE BREAKDOWN BY QUESTION', margin + 3, yPos + 8);
    
    // Mini bar chart
    const barWidth = (pageWidth - 2 * margin - 30) / Math.max(questionFeedback.length, 1);
    questionFeedback.forEach((q, i) => {
      const barX = margin + 5 + i * (barWidth + 2);
      const barHeight = 15 * (q.overallScore / 100);
      const barColor = getScoreColor(q.overallScore);
      
      doc.setFillColor(...barColor);
      doc.roundedRect(barX, yPos + 25 - barHeight, barWidth - 2, barHeight, 1, 1, 'F');
      
      doc.setFontSize(6);
      doc.setTextColor(...colors.gray);
      doc.text(`Q${i + 1}`, barX + (barWidth - 2) / 2, yPos + 30, { align: 'center' });
    });

    // ========== Footer ==========
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(doc.setFillColor(setFill(colors.primary)));
      doc.rect(0, pageHeight - 8, pageWidth, 8, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `InterYou - AI-Powered Interview Platform | Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 3,
        { align: 'center' }
      );
    }
    
    const fileName = `InterYou_Interview_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'from-emerald-500 to-teal-500';
    if (score >= 80) return 'from-teal-500 to-cyan-500';
    if (score >= 70) return 'from-cyan-500 to-blue-500';
    if (score >= 60) return 'from-blue-500 to-indigo-500';
    return 'from-red-500 to-orange-500';
  };

  const getScoreTextColor = (score: number): string => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-teal-600';
    if (score >= 70) return 'text-cyan-600';
    if (score >= 60) return 'text-blue-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-slate-400" />;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'questions', label: 'Questions', icon: MessageSquare },
    { id: 'analysis', label: 'Analysis', icon: Brain },
    { id: 'report', label: 'Full Report', icon: FileText }
  ];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100/80 overflow-hidden">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm flex-shrink-0">
        <div className="max-w-[1920px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-teal-400 via-emerald-400 to-teal-300 rounded-full shadow-sm opacity-80"
                    style={{ height: `${i * 5 + 6}px` }}
                  />
                ))}
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent">
                Inter<span className="bg-gradient-to-r from-teal-500 to-emerald-400 bg-clip-text text-transparent">You</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {interview && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">{interview.role}</span>
                  <span className="text-slate-400">@</span>
                  <span className="text-sm font-bold text-slate-900">{interview.company}</span>
                </div>
              )}
              <button
                onClick={onBack}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b border-slate-200 bg-white/50">
          <div className="max-w-[1600px] mx-auto px-6">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600 bg-teal-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto px-6 py-6">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-2xl border border-emerald-400/50 p-8 text-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                  
                  <div className="relative z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
                    >
                      <CheckCircle className="w-12 h-12 text-emerald-500" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-white mb-2">Interview Completed!</h2>
                    <p className="text-white/90 text-lg">Your responses have been analyzed by our AI system</p>
                  </div>
                </motion.div>

                <div className="grid md:grid-cols-[2fr_1fr] gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${getScoreColor(analysis.avgScore)} rounded-xl flex items-center justify-center shadow-lg`}>
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Overall Performance</h3>
                          <p className="text-xs text-slate-500">AI-Generated Score</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(analysis.performanceTrend)}
                        <span className={`text-sm font-medium ${analysis.performanceTrend > 0 ? 'text-emerald-600' : analysis.performanceTrend < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                          {analysis.performanceTrend > 0 ? '+' : ''}{analysis.performanceTrend} trend
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-end gap-2 mb-4">
                      <span className={`text-6xl font-bold ${getScoreTextColor(analysis.avgScore)}`}>
                        {analysis.avgScore}
                      </span>
                      <span className="text-2xl font-bold text-slate-400 mb-2">/100</span>
                      <span className="ml-4 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold">
                        {finalReport.level}
                      </span>
                    </div>
                    
                    <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${analysis.avgScore}%` }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className={`h-full bg-gradient-to-r ${getScoreColor(analysis.avgScore)} rounded-full`}
                      />
                    </div>
                    
                    <p className="text-sm text-slate-600 mt-4">{finalReport.summary}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl shadow-xl border border-violet-400/50 p-6 text-white relative overflow-hidden cursor-pointer group hover:shadow-2xl transition-all"
                    onClick={handleDownloadPDF}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                    <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-white/30 transition-all"
                      >
                        <Download className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-lg font-bold mb-1">Download Full Report</h3>
                      <p className="text-sm text-white/80">Get comprehensive PDF feedback</p>
                      <div className="mt-4 flex items-center gap-2 text-xs text-white/60">
                        <FileText className="w-4 h-4" />
                        Includes all questions & recommendations
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6"
                >
                  <div className="flex items-center gap-2 mb-5">
                    <BarChart3 className="w-5 h-5 text-teal-600" />
                    <h3 className="text-base font-bold text-slate-900">Detailed Evaluation Metrics</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                      { key: 'avgCorrectness', label: 'Answer Correctness', icon: CheckCircle, desc: 'Accuracy & relevance', score: analysis.avgCorrectness },
                      { key: 'avgConfidence', label: 'Confidence', icon: Zap, desc: 'Speaking confidence', score: analysis.avgConfidence },
                      { key: 'avgClarity', label: 'Clarity', icon: MessageSquare, desc: 'Structure & articulation', score: analysis.avgClarity },
                      { key: 'avgEyeContact', label: 'Eye Contact', icon: Eye, desc: 'Camera attention', score: analysis.avgEyeContact },
                      { key: 'avgBodyLanguage', label: 'Body Language', icon: Users, desc: 'Posture & presence', score: analysis.avgBodyLanguage }
                    ].map(({ key, label, icon: Icon, desc, score }, index) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200/50"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-4 h-4 text-teal-600" />
                          <span className="text-xs font-semibold text-slate-700">{label}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-2xl font-bold ${getScoreTextColor(score)}`}>{score}</span>
                          <span className="text-xs text-slate-400">/100</span>
                        </div>
                        <div className="bg-white rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                            className={`h-full bg-gradient-to-r ${getScoreColor(score)} rounded-full`}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">{desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-4 border-b border-emerald-200/50">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        <h4 className="text-sm font-bold text-emerald-900">Key Strengths</h4>
                      </div>
                    </div>
                    <div className="p-5 space-y-3 max-h-[300px] overflow-y-auto">
                      {finalReport.strengths.length > 0 ? finalReport.strengths.map((strength, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          className="flex gap-2"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-700 leading-relaxed">{strength}</p>
                        </motion.div>
                      )) : (
                        <p className="text-xs text-slate-500">Keep practicing to build strengths!</p>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 border-b border-amber-200/50">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <h4 className="text-sm font-bold text-amber-900">Areas for Improvement</h4>
                      </div>
                    </div>
                    <div className="p-5 space-y-3 max-h-[300px] overflow-y-auto">
                      {finalReport.weaknesses.length > 0 ? finalReport.weaknesses.map((weakness, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                          className="flex gap-2"
                        >
                          <XCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-700 leading-relaxed">{weakness}</p>
                        </motion.div>
                      )) : (
                        <p className="text-xs text-slate-500">Great job! No major weaknesses identified.</p>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-5 py-4 border-b border-violet-200/50">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-violet-600" />
                        <h4 className="text-sm font-bold text-violet-900">Recommendations</h4>
                      </div>
                    </div>
                    <div className="p-5 space-y-3 max-h-[300px] overflow-y-auto">
                      {finalReport.improvement_plan.slice(0, 5).map((recommendation, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.0 + index * 0.1 }}
                          className="flex gap-2"
                        >
                          <Star className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-700 leading-relaxed">{recommendation}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'questions' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-4">Question-by-Question Analysis</h3>
                {questionFeedback.map((q, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm font-bold">
                          Q{index + 1}
                        </span>
                        <div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            q.questionType === 'technical' ? 'bg-blue-50 text-blue-700' : 
                            q.questionType === 'coding' ? 'bg-purple-50 text-purple-700' :
                            q.questionType === 'behavioral' ? 'bg-emerald-50 text-emerald-700' :
                            'bg-slate-50 text-slate-700'
                          }`}>
                            {q.questionType}
                          </span>
                          <span className="ml-2 text-xs text-slate-500">{q.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getScoreTextColor(q.overallScore)}`}>
                          {q.overallScore}
                        </span>
                        <span className="text-sm text-slate-400">/100</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-slate-700 font-medium">{q.question}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Your Answer:</p>
                        <p className="text-sm text-slate-700">{q.answer.substring(0, 200)}{q.answer.length > 200 ? '...' : ''}</p>
                      </div>
                      {q.sampleAnswer && (
                        <div>
                          <p className="text-xs text-teal-600 mb-1">Model Answer:</p>
                          <p className="text-sm text-slate-600">{q.sampleAnswer.substring(0, 150)}...</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-500">Correctness:</span>
                        <span className={`font-semibold ${getScoreTextColor(q.correctness)}`}>{q.correctness}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-500">Confidence:</span>
                        <span className={`font-semibold ${getScoreTextColor(q.confidence)}`}>{q.confidence}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-500">Clarity:</span>
                        <span className={`font-semibold ${getScoreTextColor(q.clarity)}`}>{q.clarity}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-500">Eye Contact:</span>
                        <span className={`font-semibold ${getScoreTextColor(q.eyeContact)}`}>{q.eyeContact}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs text-amber-600 mb-1">Feedback:</p>
                      <p className="text-sm text-slate-600">{q.feedback}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {q.suggestions.map((s, i) => (
                          <span key={i} className="px-2 py-1 bg-violet-50 text-violet-700 rounded text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'analysis' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-4">Detailed Analysis</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="w-5 h-5 text-teal-600" />
                      <h4 className="text-base font-bold text-slate-900">Technical Skills Evaluation</h4>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-2xl font-bold ${
                        analysis.technicalSkillsEval === 'Strong' ? 'text-emerald-600' :
                        analysis.technicalSkillsEval === 'Moderate' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {analysis.technicalSkillsEval}
                      </span>
                      <span className="text-sm text-slate-500">- Based on answer correctness</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {analysis.technicalSkillsEval === 'Strong' 
                        ? 'You demonstrated strong technical knowledge and accuracy in your responses.'
                        : analysis.technicalSkillsEval === 'Moderate'
                        ? 'Your technical answers were adequate but could benefit from more depth and specificity.'
                        : 'Focus on strengthening your technical knowledge and providing more detailed answers.'}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="w-5 h-5 text-teal-600" />
                      <h4 className="text-base font-bold text-slate-900">Communication Skills Evaluation</h4>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-2xl font-bold ${
                        analysis.communicationSkillsEval === 'Good' ? 'text-emerald-600' :
                        analysis.communicationSkillsEval === 'Fair' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {analysis.communicationSkillsEval}
                      </span>
                      <span className="text-sm text-slate-500">- Based on clarity & confidence</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {analysis.communicationSkillsEval === 'Good'
                        ? 'Your communication was clear and confident throughout the interview.'
                        : 'Work on improving your clarity and building more confidence in your delivery.'}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="w-5 h-5 text-teal-600" />
                      <h4 className="text-base font-bold text-slate-900">Confidence Analysis</h4>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-2xl font-bold ${
                        analysis.avgConfidence >= 75 ? 'text-emerald-600' :
                        analysis.avgConfidence >= 50 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {analysis.avgConfidence}%
                      </span>
                      <span className="text-sm text-slate-500">confidence level</span>
                    </div>
                    <p className="text-sm text-slate-600">{analysis.confidenceAnalysis}</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-teal-600" />
                      <h4 className="text-base font-bold text-slate-900">Behavioral Analysis</h4>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-2xl font-bold ${
                        (analysis.avgEyeContact + analysis.avgBodyLanguage) / 2 >= 70 ? 'text-emerald-600' :
                        (analysis.avgEyeContact + analysis.avgBodyLanguage) / 2 >= 50 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {Math.round((analysis.avgEyeContact + analysis.avgBodyLanguage) / 2)}%
                      </span>
                      <span className="text-sm text-slate-500">overall score</span>
                    </div>
                    <p className="text-sm text-slate-600">{analysis.behavioralAnalysis}</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <PieChart className="w-5 h-5 text-teal-600" />
                    <h4 className="text-base font-bold text-slate-900">Question Type Performance</h4>
                  </div>
                  <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {analysis.avgByType.map(({ type, count, avg }) => (
                      <div key={type} className="bg-slate-50 rounded-lg p-3 text-center">
                        <span className="text-xs text-slate-500 uppercase">{type}</span>
                        <p className={`text-xl font-bold ${getScoreTextColor(avg)}`}>{avg}</p>
                        <span className="text-xs text-slate-400">{count} questions</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'report' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Full Interview Report</h3>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Interview Performance Report</h2>
                    <p className="text-slate-500">
                      {interview?.role} at {interview?.company} | {new Date().toLocaleDateString()}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-4">Performance Summary</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-slate-600">Overall Score</span>
                          <span className={`text-2xl font-bold ${getScoreTextColor(analysis.avgScore)}`}>
                            {analysis.avgScore}/100
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-slate-600">Interview Level</span>
                          <span className="text-xl font-bold text-teal-600">{finalReport.level}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-slate-600">Questions Answered</span>
                          <span className="text-xl font-bold text-slate-900">{analysis.totalQuestions}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-slate-600">Performance Trend</span>
                          <span className={`flex items-center gap-1 font-semibold ${
                            analysis.performanceTrend > 0 ? 'text-emerald-600' :
                            analysis.performanceTrend < 0 ? 'text-red-600' : 'text-slate-600'
                          }`}>
                            {analysis.performanceTrend > 0 ? <TrendingUp className="w-4 h-4" /> : 
                             analysis.performanceTrend < 0 ? <TrendingDown className="w-4 h-4" /> : 
                             <Activity className="w-4 h-4" />}
                            {analysis.performanceTrend > 0 ? '+' : ''}{analysis.performanceTrend}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-4">Score Breakdown</h4>
                      <div className="space-y-3">
                        {[
                          { label: 'Correctness', value: analysis.avgCorrectness },
                          { label: 'Confidence', value: analysis.avgConfidence },
                          { label: 'Clarity', value: analysis.avgClarity },
                          { label: 'Eye Contact', value: analysis.avgEyeContact },
                          { label: 'Body Language', value: analysis.avgBodyLanguage }
                        ].map(({ label, value }) => (
                          <div key={label} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">{label}</span>
                              <span className={`font-semibold ${getScoreTextColor(value)}`}>{value}/100</span>
                            </div>
                            <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${getScoreColor(value)} rounded-full`}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-8">
                    <h4 className="text-lg font-bold text-slate-900 mb-4">Summary</h4>
                    <p className="text-slate-600 leading-relaxed">{finalReport.summary}</p>
                  </div>

                  <div className="border-t border-slate-200 pt-8 mt-8">
                    <h4 className="text-lg font-bold text-slate-900 mb-4">Graph Data (for charts)</h4>
                    <div className="bg-slate-50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                      <pre>{JSON.stringify(finalReport.graph_data, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white p-4">
          <div className="max-w-[1600px] mx-auto flex justify-center">
            <button
              onClick={onBack}
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Practice Another Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
