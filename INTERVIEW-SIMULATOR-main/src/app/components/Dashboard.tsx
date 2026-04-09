import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Video, 
  BarChart3, 
  Award,
  ArrowRight,
  Clock,
  Target,
  TrendingUp,
  CheckCircle2,
  Play,
  Calendar,
  Sparkles,
  User as UserIcon,
  Bell,
  ChevronRight,
  X,
  Download,
  CheckCircle,
  Lightbulb,
  Star,
  Zap,
  Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import { apiService, User, Interview } from '../services/api';
import { toast } from 'sonner';

interface DashboardProps {
  onStartInterview: () => void;
}

export function Dashboard({ onStartInterview }: DashboardProps) {
  const [selectedInterview, setSelectedInterview] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [profile, interviewList] = await Promise.all([
        apiService.getProfile(),
        apiService.getInterviews()
      ]);
      setUser(profile);
      setInterviews(interviewList);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch {
      // Ignore logout errors
    }
    window.location.href = '/';
  };

  // Workflow steps
  const workflowSteps = [
    {
      number: 1,
      title: 'Upload Resume',
      description: 'Share your professional background',
      icon: Upload,
      gradient: 'from-sky-400 to-blue-500',
      bgGradient: 'from-sky-50 to-blue-50',
      time: '2 min'
    },
    {
      number: 2,
      title: 'AI Resume Analysis',
      description: 'Get instant insights & recommendations',
      icon: FileText,
      gradient: 'from-emerald-400 to-green-500',
      bgGradient: 'from-emerald-50 to-green-50',
      time: '1 min'
    },
    {
      number: 3,
      title: 'Video Interview',
      description: 'Answer AI-powered questions',
      icon: Video,
      gradient: 'from-blue-500 to-sky-600',
      bgGradient: 'from-blue-50 to-sky-50',
      time: '15-45 min'
    },
    {
      number: 4,
      title: 'Performance Analysis',
      description: 'Comprehensive feedback & scoring',
      icon: BarChart3,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      time: '2 min'
    },
    {
      number: 5,
      title: 'Get Job Ready',
      description: 'Actionable insights & next steps',
      icon: Award,
      gradient: 'from-yellow-400 to-amber-500',
      bgGradient: 'from-yellow-50 to-amber-50',
      time: 'Ongoing'
    }
  ];

  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const totalScore = completedInterviews.length > 0 
    ? Math.round(completedInterviews.reduce((acc, i) => acc + (i.totalDuration || 0), 0) / completedInterviews.length)
    : 0;
  const totalTime = Math.round(completedInterviews.reduce((acc, i) => acc + (i.totalDuration || 0), 0) / 60);

  const stats = [
    { label: 'Interviews Completed', value: String(completedInterviews.length), icon: CheckCircle2, gradient: 'from-sky-500 to-blue-600', iconColor: 'text-blue-600' },
    { label: 'Average Score', value: String(totalScore || 0), icon: TrendingUp, gradient: 'from-emerald-500 to-green-600', iconColor: 'text-green-600' },
    { label: 'Time Practiced', value: `${totalTime || 0}h`, icon: Clock, gradient: 'from-yellow-400 to-amber-500', iconColor: 'text-amber-600' },
    { label: 'Skills Improved', value: '12', icon: Target, gradient: 'from-blue-600 to-sky-600', iconColor: 'text-sky-600' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-sky-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-sky-400 via-blue-500 to-emerald-400 rounded-full shadow-sm"
                    style={{ height: `${i * 6 + 10}px` }}
                  />
                ))}
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-700 bg-clip-text text-transparent">
                Inter<span className="bg-gradient-to-r from-teal-500 to-emerald-400 bg-clip-text text-transparent">You</span>
              </h1>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              <button className="w-11 h-11 flex items-center justify-center rounded-xl bg-white shadow-sm hover:shadow-md border border-slate-200/70 transition-all relative group">
                <Bell className="w-5 h-5 text-slate-600 group-hover:text-sky-600 transition-colors" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-sm"></div>
              </button>
              <button className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all shadow-md shadow-sky-500/30">
                <UserIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-5xl font-bold text-slate-900 mb-3">
            Welcome back, <span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">{user?.name || 'there'}!</span>
          </h2>
          <p className="text-lg text-slate-600">Ready to ace your next interview? Let's get started.</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-md border border-slate-200/60 hover:shadow-xl hover:border-slate-300 transition-all relative overflow-hidden group"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 blur-3xl transition-opacity`}></div>
                <div className="relative">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-slate-600 mb-1 font-medium">{stat.label}</p>
                  <p className={`text-4xl font-bold ${stat.iconColor}`}>{stat.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main CTA - Start Interview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-gradient-to-br from-sky-500 via-blue-600 to-sky-600 rounded-3xl p-12 mb-12 relative overflow-hidden shadow-2xl shadow-sky-600/40"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-yellow-300/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full mb-5">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-sm font-bold text-white">AI-Powered Interview Practice</span>
              </div>
              <h3 className="text-4xl font-bold text-white mb-4">Start Your Interview Journey</h3>
              <p className="text-lg text-white/95 mb-8 max-w-2xl leading-relaxed">
                Upload your resume, practice with our AI interviewer, and get personalized feedback to land your dream job.
              </p>
              <button
                onClick={onStartInterview}
                className="px-10 py-5 bg-white text-sky-600 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95 flex items-center gap-3 group"
              >
                <Play className="w-6 h-6" />
                Let's Start
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="hidden lg:block">
              <div className="w-72 h-72 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                <Video className="w-36 h-36 text-white/90" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Interview Workflow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-12"
        >
          <div className="mb-10">
            <h3 className="text-3xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Zap className="w-8 h-8 text-yellow-500" />
              How It Works
            </h3>
            <p className="text-lg text-slate-600">Your path to interview success in 5 simple steps</p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-sky-200 via-emerald-200 to-yellow-200 hidden lg:block" style={{ width: 'calc(100% - 120px)', left: '60px' }}></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="relative"
                  >
                    <div className={`bg-gradient-to-br ${step.bgGradient} rounded-2xl p-6 shadow-md border border-slate-200/60 hover:shadow-xl hover:border-slate-300 transition-all relative z-10 h-full`}>
                      {/* Step Icon with Number */}
                      <div className="relative mb-4">
                        <div className={`w-14 h-14 bg-gradient-to-br ${step.gradient} rounded-xl flex items-center justify-center shadow-xl`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border-2 border-slate-200 flex items-center justify-center shadow-lg">
                          <span className="text-xs font-bold text-slate-800">{step.number}</span>
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-slate-900 mb-2 text-base">{step.title}</h4>
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">{step.description}</p>
                      
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {step.time}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Performance Stats & Streak */}
        {interviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Total Interviews */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-slate-900">{interviews.length}</span>
                </div>
                <p className="text-sm text-slate-600">Total Interviews</p>
                <div className="mt-2 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i < interviews.length % 5 ? 'bg-blue-500' : 'bg-slate-200'}`} />
                  ))}
                </div>
              </div>

              {/* Average Score */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-slate-900">
                    {Math.round(interviews.reduce((acc, i) => acc + ((i as any).overallScore || 0), 0) / interviews.length) || 0}%
                  </span>
                </div>
                <p className="text-sm text-slate-600">Average Score</p>
                <div className="mt-2 w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                    style={{ width: `${Math.round(interviews.reduce((acc, i) => acc + ((i as any).overallScore || 0), 0) / interviews.length) || 0}%` }}
                  />
                </div>
              </div>

              {/* Practice Streak */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-slate-900">{Math.min(interviews.length, 7)}</span>
                </div>
                <p className="text-sm text-slate-600">Day Streak 🔥</p>
                <div className="mt-2 flex gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-6 flex-1 rounded-lg flex items-center justify-center text-xs font-bold ${
                        i < Math.min(interviews.length, 7) 
                          ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' 
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Score */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-slate-900">
                    {Math.max(...interviews.map(i => (i as any).overallScore || 0), 0)}%
                  </span>
                </div>
                <p className="text-sm text-slate-600">Best Score</p>
                <div className="mt-2 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.ceil((Math.max(...interviews.map(i => (i as any).overallScore || 0), 0) / 20)) ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                Performance Trend
              </h4>
              <div className="h-32 flex items-end gap-2">
                {interviews.slice(-8).map((interview, index) => {
                  const score = (interview as any).overallScore || 0;
                  const height = `${Math.max(score, 10)}%`;
                  const prevScore = index > 0 ? (interviews.slice(-8)[index - 1] as any)?.overallScore || 0 : 0;
                  const isImprovement = index > 0 && score > prevScore;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className={`w-full rounded-t-lg transition-all ${
                          isImprovement 
                            ? 'bg-gradient-to-t from-emerald-500 to-emerald-400' 
                            : score >= 70 
                            ? 'bg-gradient-to-t from-teal-500 to-teal-400'
                            : score >= 50
                            ? 'bg-gradient-to-t from-yellow-500 to-yellow-400'
                            : 'bg-gradient-to-t from-red-500 to-red-400'
                        }`}
                        style={{ height }}
                      />
                      <span className="text-xs text-slate-500">#{interviews.length - 7 + index + 1}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>Oldest</span>
                <span>Most Recent</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Interviews */}
        {interviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-slate-900 mb-2">Recent Interviews</h3>
                <p className="text-base text-slate-600">Review your past practice sessions</p>
              </div>
              <button className="text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group px-4 py-2 rounded-lg hover:bg-sky-50 transition-all">
                View All
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {interviews.slice(0, 5).map((interview) => (
                <div
                  key={interview._id}
                  onClick={() => setSelectedInterview(interview._id as unknown as number)}
                  className="bg-white rounded-2xl p-7 shadow-md border border-slate-200/60 hover:shadow-xl hover:border-sky-300 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-600/30">
                        <Video className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2 text-lg">{interview.role} at {interview.company}</h4>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {new Date(interview.createdAt || Date.now()).toLocaleDateString()}
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {interview.totalDuration ? `${Math.round(interview.totalDuration / 60)} min` : `${interview.questionCount} questions`}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-slate-600 mb-1 font-medium">Status</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent capitalize">
                          {interview.status.replace('_', ' ')}
                        </p>
                      </div>
                      <button className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all shadow-sm group-hover:shadow-md">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Analytics Modal */}
      {selectedInterview !== null && (
        <InterviewAnalyticsModal
          interview={interviews.find(i => i._id === String(selectedInterview))!}
          onClose={() => setSelectedInterview(null)}
        />
      )}
    </div>
  );
}

// Analytics Modal Component
interface InterviewAnalyticsModalProps {
  interview: Interview;
  onClose: () => void;
}

function InterviewAnalyticsModal({ interview, onClose }: InterviewAnalyticsModalProps) {
  const performanceMetrics = {
    overallScore: 75,
    communication: 92,
    technicalKnowledge: 85,
    confidence: 88,
    clarity: 90,
    professionalism: 86
  };

  const strengthsAndImprovements = {
    strengths: [
      "Excellent communication skills with clear, structured responses",
      "Strong technical knowledge demonstrated across multiple domains",
      "Confident delivery with appropriate body language and eye contact",
      "Specific examples provided to support answers"
    ],
    improvements: [
      "Consider adding more quantifiable metrics when discussing achievements",
      "Practice reducing filler words like 'um' and 'ah' for smoother delivery",
      "Expand on the impact of your work with concrete business outcomes"
    ],
    recommendations: [
      "Prepare a portfolio of 3-5 key projects with measurable results",
      "Practice the STAR method (Situation, Task, Action, Result) for behavioral questions",
      "Research the company's recent initiatives to tailor your responses",
      "Develop concise 30-second and 2-minute personal introduction versions"
    ]
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(14, 165, 233);
    doc.text('InterYou', margin, yPos);
    
    yPos += 10;
    doc.setFontSize(18);
    doc.setTextColor(51, 65, 85);
    doc.text('Interview Performance Report', margin, yPos);
    
    yPos += 8;
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(`Position: ${interview.role} at ${interview.company}`, margin, yPos);
    
    yPos += 6;
    doc.text(`Date: ${new Date(interview.createdAt || Date.now()).toLocaleDateString()}`, margin, yPos);
    
    yPos += 6;
    doc.text(`Duration: ${interview.totalDuration ? `${Math.round(interview.totalDuration / 60)} min` : 'N/A'}`, margin, yPos);
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, yPos);
    
    yPos += 10;
    doc.setLineWidth(0.5);
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    // Overall Score
    yPos += 15;
    doc.setFontSize(16);
    doc.setTextColor(51, 65, 85);
    doc.text('Overall Performance Score', margin, yPos);
    
    yPos += 10;
    doc.setFontSize(32);
    doc.setTextColor(14, 165, 233);
    doc.text(`${performanceMetrics.overallScore}/100`, margin, yPos);
    
    // Performance Metrics
    yPos += 15;
    doc.setFontSize(14);
    doc.setTextColor(51, 65, 85);
    doc.text('Detailed Performance Metrics', margin, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    
    const metrics = [
      `Communication Skills: ${performanceMetrics.communication}/100`,
      `Technical Knowledge: ${performanceMetrics.technicalKnowledge}/100`,
      `Confidence: ${performanceMetrics.confidence}/100`,
      `Clarity: ${performanceMetrics.clarity}/100`,
      `Professionalism: ${performanceMetrics.professionalism}/100`
    ];
    
    metrics.forEach(metric => {
      doc.text(`• ${metric}`, margin + 5, yPos);
      yPos += 6;
    });
    
    // Strengths
    yPos += 10;
    doc.setFontSize(14);
    doc.setTextColor(51, 65, 85);
    doc.text('Key Strengths', margin, yPos);
    
    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    
    strengthsAndImprovements.strengths.forEach((strength, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${strength}`, pageWidth - 2 * margin - 5);
      lines.forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin + 5, yPos);
        yPos += 5;
      });
    });
    
    // Areas for Improvement
    yPos += 8;
    doc.setFontSize(14);
    doc.setTextColor(51, 65, 85);
    doc.text('Areas for Improvement', margin, yPos);
    
    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    
    strengthsAndImprovements.improvements.forEach((improvement, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${improvement}`, pageWidth - 2 * margin - 5);
      lines.forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin + 5, yPos);
        yPos += 5;
      });
    });
    
    // Recommendations
    yPos += 8;
    doc.setFontSize(14);
    doc.setTextColor(51, 65, 85);
    doc.text('Recommendations for Success', margin, yPos);
    
    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    
    strengthsAndImprovements.recommendations.forEach((recommendation, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${recommendation}`, pageWidth - 2 * margin - 5);
      lines.forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin + 5, yPos);
        yPos += 5;
      });
    });
    
    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `InterYou - AI-Powered Interview Platform | Page ${i} of ${totalPages}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`InterYou_${interview.role.replace(/\s+/g, '_')}_Report.pdf`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-emerald-500 to-green-500';
    if (score >= 80) return 'from-sky-500 to-blue-600';
    if (score >= 70) return 'from-yellow-400 to-amber-500';
    return 'from-blue-500 to-indigo-500';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-sky-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-blue-600';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-6 rounded-t-3xl border-b border-sky-400/50 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">Interview Performance Analytics</h2>
              <p className="text-white/95 text-base font-medium">{interview.role} • {new Date(interview.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
            <button
              onClick={onClose}
              className="w-11 h-11 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Overall Score & Download */}
          <div className="grid md:grid-cols-[2fr_1fr] gap-6 mb-8">
            {/* Overall Score */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border-2 border-slate-200/80 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${getScoreColor(performanceMetrics.overallScore)} rounded-xl flex items-center justify-center shadow-xl`}>
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Overall Performance</h3>
                  <p className="text-sm text-slate-600 font-medium">AI-Generated Score</p>
                </div>
              </div>
              <div className="flex items-end gap-2 mb-6">
                <span className={`text-7xl font-bold ${getScoreTextColor(performanceMetrics.overallScore)}`}>
                  {performanceMetrics.overallScore}
                </span>
                <span className="text-4xl font-bold text-slate-400 mb-3">/100</span>
              </div>
              <div className="bg-slate-200 rounded-full h-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${performanceMetrics.overallScore}%` }}
                  transition={{ delay: 0.3, duration: 1 }}
                  className={`h-full bg-gradient-to-r ${getScoreColor(performanceMetrics.overallScore)} rounded-full`}
                />
              </div>
            </div>

            {/* Download Button */}
            <div
              onClick={handleDownloadPDF}
              className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl border-2 border-violet-400/50 p-6 text-white relative overflow-hidden cursor-pointer group hover:shadow-2xl transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-all shadow-xl"
                >
                  <Download className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Download Report</h3>
                <p className="text-sm text-white/90 font-medium">Get detailed PDF feedback</p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border-2 border-slate-200/80 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-sky-600" />
              <h3 className="text-xl font-bold text-slate-900">Detailed Performance Metrics</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {Object.entries({
                communication: 'Communication Skills',
                technicalKnowledge: 'Technical Knowledge',
                confidence: 'Confidence',
                clarity: 'Clarity',
                professionalism: 'Professionalism'
              }).map(([key, label], index) => {
                const score = performanceMetrics[key as keyof typeof performanceMetrics];
                return (
                  <div
                    key={key}
                    className="bg-white rounded-xl p-5 border-2 border-slate-200/60 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-bold text-slate-800">{label}</span>
                      <span className={`text-2xl font-bold ${getScoreTextColor(score)}`}>{score}</span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                        className={`h-full bg-gradient-to-r ${getScoreColor(score)} rounded-full`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths, Improvements, Recommendations */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Strengths */}
            <div className="bg-white rounded-2xl border-2 border-emerald-200/80 overflow-hidden shadow-md">
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-5 border-b-2 border-emerald-200/80">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                  <h4 className="text-base font-bold text-emerald-900">Key Strengths</h4>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {strengthsAndImprovements.strengths.map((strength, index) => (
                  <div key={index} className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700 leading-relaxed">{strength}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvements */}
            <div className="bg-white rounded-2xl border-2 border-amber-200/80 overflow-hidden shadow-md">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-5 border-b-2 border-amber-200/80">
                <div className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-amber-600" />
                  <h4 className="text-base font-bold text-amber-900">Areas for Improvement</h4>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {strengthsAndImprovements.improvements.map((improvement, index) => (
                  <div key={index} className="flex gap-3">
                    <Award className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700 leading-relaxed">{improvement}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl border-2 border-violet-200/80 overflow-hidden shadow-md">
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-5 border-b-2 border-violet-200/80">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-violet-600" />
                  <h4 className="text-base font-bold text-violet-900">Recommendations</h4>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {strengthsAndImprovements.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex gap-3">
                    <Star className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700 leading-relaxed">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
