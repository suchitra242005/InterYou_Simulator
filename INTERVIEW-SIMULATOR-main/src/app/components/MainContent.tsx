import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Play, 
  Target, 
  Award, 
  Clock, 
  Bell,
  User as UserIcon,
  BarChart3,
  Zap,
  Brain,
  FileText,
  ClipboardList,
  TrendingDown,
  Lightbulb,
  MessageSquare,
  RefreshCw,
  Download,
  Share2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Star,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Code,
  Sparkles,
  Mic,
  Video,
  ArrowRight,
  ChevronRight,
  Activity,
  Percent,
  MoreHorizontal
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell, Area, AreaChart } from 'recharts';

type WorkflowSection = 'profile' | 'summary' | 'performance' | 'ai-suggestions' | 'feedback' | 'actions';

export function MainContent() {
  const [activeSection, setActiveSection] = useState<WorkflowSection>('profile');

  // Navigation items with new workflow structure
  const navItems = [
    { id: 'profile' as WorkflowSection, label: 'Profile & Resume', icon: UserIcon, description: 'Personal insights', gradient: 'from-violet-500 to-purple-500' },
    { id: 'summary' as WorkflowSection, label: 'Interview Summary', icon: ClipboardList, description: 'Overview & stats', gradient: 'from-cyan-500 to-teal-500' },
    { id: 'performance' as WorkflowSection, label: 'Performance Metrics', icon: BarChart3, description: 'Detailed analysis', gradient: 'from-teal-500 to-emerald-500' },
    { id: 'ai-suggestions' as WorkflowSection, label: 'AI Recommendations', icon: Sparkles, description: 'Smart insights', gradient: 'from-fuchsia-500 to-pink-500' },
    { id: 'feedback' as WorkflowSection, label: 'Question Analysis', icon: MessageSquare, description: 'Response breakdown', gradient: 'from-emerald-500 to-green-500' },
    { id: 'actions' as WorkflowSection, label: 'Next Steps', icon: RefreshCw, description: 'Actions & export', gradient: 'from-blue-500 to-cyan-500' },
  ];

  // Profile data
  const profileData = {
    name: 'Katie Anderson',
    email: 'katie.anderson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    targetRole: 'Senior Frontend Developer',
    experience: '5 years',
    education: 'BS Computer Science, Stanford University',
  };

  const resumeInsights = [
    { category: 'Technical Skills', score: 85, feedback: 'Strong foundation in React, TypeScript, and modern frameworks', trend: 'up', color: 'from-cyan-500 to-teal-500' },
    { category: 'Project Experience', score: 72, feedback: 'Solid portfolio with diverse technical projects', trend: 'stable', color: 'from-violet-500 to-purple-500' },
    { category: 'Communication', score: 68, feedback: 'Focus on clarity, structure, and executive presence', trend: 'up', color: 'from-emerald-500 to-green-500' },
  ];

  // Interview questions data
  const questionFeedback = [
    { id: 1, question: 'Tell me about yourself', score: 85, status: 'good', feedback: 'Great structure using past-present-future format. Mentioned key achievements with specific metrics.' },
    { id: 2, question: 'What is your biggest weakness?', score: 72, status: 'average', feedback: 'Showed self-awareness, but could elaborate more on concrete improvement steps taken.' },
    { id: 3, question: 'Describe a challenging project', score: 90, status: 'excellent', feedback: 'Excellent STAR method application. Clear situation, actions, and quantifiable results.' },
    { id: 4, question: 'Where do you see yourself in 5 years?', score: 65, status: 'needs-improvement', feedback: 'Answer was too generic. Be more specific about career trajectory and alignment with role.' },
    { id: 5, question: 'How do you handle conflict?', score: 78, status: 'good', feedback: 'Good use of real example. Could strengthen by discussing prevention strategies.' },
  ];

  // Performance metrics
  const performanceData = [
    { id: 'clarity', metric: 'Clarity', score: 85, change: +5 },
    { id: 'confidence', metric: 'Confidence', score: 78, change: +3 },
    { id: 'technical', metric: 'Technical Depth', score: 82, change: +8 },
    { id: 'body', metric: 'Body Language', score: 75, change: -2 },
    { id: 'time', metric: 'Time Management', score: 70, change: +4 },
  ];

  const performanceTimeline = [
    { id: 's1', session: '1', score: 62 },
    { id: 's2', session: '2', score: 68 },
    { id: 's3', session: '3', score: 71 },
    { id: 's4', session: '4', score: 75 },
    { id: 's5', session: '5', score: 78 },
  ];

  const COLORS = ['#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16'];

  // AI Suggestions
  const aiSuggestions = [
    { id: 1, type: 'improvement', title: 'Reduce Filler Words', description: 'Detected 15 instances of "um", "like", "you know". Practice pausing instead of filling silence.', priority: 'high', impact: 'High' },
    { id: 2, type: 'strength', title: 'Excellent Eye Contact', description: 'Maintained strong eye contact 92% of the interview. This builds trust and engagement.', priority: 'low', impact: 'Maintain' },
    { id: 3, type: 'improvement', title: 'Pace Your Speaking', description: 'Speaking speed averaged 180 WPM. Optimal range is 140-160 WPM for clarity.', priority: 'medium', impact: 'Medium' },
    { id: 4, type: 'improvement', title: 'Add Quantifiable Achievements', description: 'Include specific metrics when discussing accomplishments (e.g., "increased performance by 40%").', priority: 'high', impact: 'High' },
    { id: 5, type: 'strength', title: 'Strong STAR Structure', description: 'Consistently used Situation, Task, Action, Result format in behavioral responses.', priority: 'low', impact: 'Maintain' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Profile Header */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-full blur-3xl"></div>
              <div className="relative flex items-start gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/20">
                  <span className="text-3xl font-bold text-white">KA</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">{profileData.name}</h2>
                  <p className="text-teal-600 font-semibold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                    {profileData.targetRole}
                  </p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-violet-600" />
                      </div>
                      <span className="text-sm">{profileData.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-4 h-4 text-cyan-600" />
                      </div>
                      <span className="text-sm">{profileData.phone}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-sm">{profileData.location}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <div className="w-8 h-8 bg-gradient-to-br from-fuchsia-100 to-pink-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-fuchsia-600" />
                      </div>
                      <span className="text-sm">{profileData.experience} experience</span>
                    </div>
                  </div>
                </div>
                <button className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 rounded-xl transition-all shadow-lg shadow-teal-500/20">
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Resume Insights */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Resume Analysis</h3>
                  <p className="text-sm text-slate-500 mt-1">AI-powered insights from your resume</p>
                </div>
                <button className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 group">
                  View Full Report
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {resumeInsights.map((insight, index) => (
                  <motion.div 
                    key={index} 
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 hover:shadow-lg hover:border-teal-200/50 transition-all relative overflow-hidden group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${insight.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity`}></div>
                    <div className="relative flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-slate-900">{insight.category}</h4>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3" />
                            Improving
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{insight.feedback}</p>
                      </div>
                      <div className="text-right ml-6">
                        <div className={`text-3xl font-bold bg-gradient-to-r ${insight.color} bg-clip-text text-transparent`}>{insight.score}</div>
                        <div className="text-xs text-slate-500 mt-1">/ 100</div>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
                      <motion.div
                        className={`bg-gradient-to-r ${insight.color} h-2 rounded-full shadow-sm`}
                        initial={{ width: 0 }}
                        animate={{ width: `${insight.score}%` }}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'summary':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Overview Stats */}
            <div className="grid grid-cols-4 gap-5">
              <motion.div 
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 relative overflow-hidden group hover:shadow-lg transition-all"
                whileHover={{ y: -4 }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-teal-500/20">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">Overall Score</h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">78</p>
                    <span className="text-sm text-slate-400">/ 100</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 relative overflow-hidden group hover:shadow-lg transition-all"
                whileHover={{ y: -4 }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">Duration</h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">42</p>
                    <span className="text-sm text-slate-400">min</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 relative overflow-hidden group hover:shadow-lg transition-all"
                whileHover={{ y: -4 }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">Questions</h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">12</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 relative overflow-hidden group hover:shadow-lg transition-all"
                whileHover={{ y: -4 }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-fuchsia-500/20">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">Type</h3>
                  <p className="text-lg font-bold text-slate-900">Technical</p>
                </div>
              </motion.div>
            </div>

            {/* Performance Trend */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Performance Trend</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={performanceTimeline}>
                  <defs>
                    <linearGradient id="summaryAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="session" 
                    stroke="#94a3b8" 
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#14b8a6"
                    strokeWidth={3}
                    fill="url(#summaryAreaGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Key Insights */}
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-6 border border-emerald-200/50 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-slate-900">Strengths</h4>
                </div>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-3 text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    Clear communication and well-structured responses
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    Strong technical knowledge and problem-solving
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    Excellent use of STAR method in behavioral questions
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-6 border border-amber-200/50 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-slate-900">Areas to Improve</h4>
                </div>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-3 text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    Reduce filler words (15 instances detected)
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    Slow down speaking pace to optimal 140-160 WPM
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    Include more quantifiable achievements in examples
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        );

      case 'performance':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Performance Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Performance Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData} layout="vertical">
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="50%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis 
                    type="number" 
                    style={{ fontSize: '12px' }} 
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="metric" 
                    style={{ fontSize: '13px', fontWeight: '500' }} 
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                    width={140}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 8, 8, 0]} fill="url(#barGradient)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-2 gap-5">
              {performanceData.map((item, index) => {
                const gradients = [
                  'from-cyan-500 to-teal-500',
                  'from-teal-500 to-emerald-500',
                  'from-emerald-500 to-green-500',
                  'from-violet-500 to-purple-500',
                  'from-blue-500 to-cyan-500'
                ];
                return (
                  <motion.div 
                    key={index} 
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 hover:shadow-lg transition-all relative overflow-hidden group"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradients[index]} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity`}></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-slate-900">{item.metric}</h4>
                        <div className="flex items-center gap-2">
                          {item.change > 0 ? (
                            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-gradient-to-r from-emerald-50 to-teal-50 px-2.5 py-1 rounded-full">
                              <TrendingUp className="w-3 h-3" />
                              +{item.change}
                            </div>
                          ) : item.change < 0 ? (
                            <div className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-gradient-to-r from-red-50 to-orange-50 px-2.5 py-1 rounded-full">
                              <TrendingDown className="w-3 h-3" />
                              {item.change}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className={`text-3xl font-bold bg-gradient-to-r ${gradients[index]} bg-clip-text text-transparent`}>{item.score}</span>
                        <span className="text-sm text-slate-400">/ 100</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className={`bg-gradient-to-r ${gradients[index]} h-2 rounded-full shadow-sm`}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.score}%` }}
                          transition={{ delay: index * 0.05 + 0.2, duration: 0.6 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );

      case 'ai-suggestions':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-fuchsia-50 via-purple-50 to-violet-50 rounded-2xl p-8 border border-fuchsia-200/50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
              <div className="relative flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">AI-Powered Recommendations</h3>
                  <p className="text-sm text-slate-600">Personalized insights to enhance your performance</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>

              <div className="space-y-4">
                {aiSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id}
                    className={`p-5 rounded-xl border backdrop-blur-sm ${
                      suggestion.type === 'improvement'
                        ? 'bg-white/60 border-amber-200/50 hover:bg-white/80'
                        : 'bg-white/60 border-emerald-200/50 hover:bg-white/80'
                    } transition-all hover:shadow-md`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                          suggestion.type === 'improvement' 
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
                            : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                        }`}>
                          {suggestion.type === 'improvement' ? (
                            <Zap className="w-5 h-5 text-white" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">{suggestion.title}</h4>
                          <p className="text-sm text-slate-600 leading-relaxed">{suggestion.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          suggestion.priority === 'high' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-sm' :
                          suggestion.priority === 'medium' ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-sm' :
                          'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-700'
                        }`}>
                          {suggestion.impact}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'feedback':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Question-by-Question Analysis</h3>
              <div className="space-y-4">
                {questionFeedback.map((item, index) => {
                  const statusConfig = {
                    'excellent': { gradient: 'from-emerald-500 to-teal-500', bg: 'from-emerald-50 to-teal-50', icon: ThumbsUp, color: 'emerald' },
                    'good': { gradient: 'from-cyan-500 to-blue-500', bg: 'from-cyan-50 to-blue-50', icon: CheckCircle2, color: 'cyan' },
                    'average': { gradient: 'from-amber-500 to-orange-500', bg: 'from-amber-50 to-orange-50', icon: AlertCircle, color: 'amber' },
                    'needs-improvement': { gradient: 'from-red-500 to-pink-500', bg: 'from-red-50 to-pink-50', icon: XCircle, color: 'red' }
                  };
                  const config = statusConfig[item.status as keyof typeof statusConfig];
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={item.id}
                      className={`p-6 bg-gradient-to-br ${config.bg} rounded-xl border border-${config.color}-200/50 hover:shadow-md transition-all`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2.5 py-1 bg-white/50 text-xs font-bold text-${config.color}-700 rounded-lg`}>Q{item.id}</span>
                            <h4 className="font-semibold text-slate-900">{item.question}</h4>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{item.feedback}</p>
                        </div>
                        <div className="flex items-center gap-4 ml-6">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${config.gradient} shadow-lg shadow-${config.color}-500/20`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-right">
                            <div className={`text-3xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>{item.score}</div>
                            <div className="text-xs text-slate-500">/ 100</div>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-white/50 rounded-full h-2.5 mt-4 overflow-hidden">
                        <motion.div
                          className={`h-2.5 rounded-full bg-gradient-to-r ${config.gradient} shadow-sm`}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.score}%` }}
                          transition={{ delay: index * 0.05 + 0.2, duration: 0.6 }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );

      case 'actions':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Export & Share */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Export & Share</h3>
              <div className="grid grid-cols-2 gap-5">
                <motion.button
                  className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200/50 hover:shadow-lg hover:border-teal-300/50 transition-all text-left group relative overflow-hidden"
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-teal-500/20">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-1">Download Report</h4>
                    <p className="text-xs text-slate-600">Export complete analysis as PDF</p>
                  </div>
                </motion.button>
                <motion.button
                  className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200/50 hover:shadow-lg hover:border-violet-300/50 transition-all text-left group relative overflow-hidden"
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20">
                      <Share2 className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-1">Share Results</h4>
                    <p className="text-xs text-slate-600">Send feedback via email</p>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Recommended Actions</h3>
              <div className="space-y-3">
                <motion.button
                  className="w-full p-5 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-white rounded-xl hover:shadow-xl transition-all flex items-center justify-between group shadow-lg shadow-teal-500/30"
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">Schedule Another Practice Session</span>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  className="w-full p-5 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 rounded-xl hover:from-slate-100 hover:to-slate-200 border border-slate-200 transition-all flex items-center justify-between group"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                      <CalendarIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold">Book Session with Career Coach</span>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  className="w-full p-5 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 rounded-xl hover:from-slate-100 hover:to-slate-200 border border-slate-200 transition-all flex items-center justify-between group"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-sm">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold">Access Learning Resources</span>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100/50 flex">
      {/* Sidebar */}
      <div
        className="w-80 bg-white/60 backdrop-blur-xl border-r border-slate-200/30 p-6 flex flex-col shadow-lg"
      >
        {/* Logo */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-teal-400 via-emerald-400 to-teal-300 rounded-full shadow-sm opacity-80"
                  style={{ height: `${i * 6 + 8}px` }}
                />
              ))}
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent">
              Inter<span className="bg-gradient-to-r from-teal-500 to-emerald-400 bg-clip-text text-transparent">You</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 ml-6">Interview Analysis Platform</p>
        </div>

        {/* Workflow Navigation */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-3">Analysis Workflow</h3>
          <nav className="space-y-2">
            {navItems.map((item, index) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left relative group ${
                    isActive
                      ? 'bg-white/80 shadow-sm text-slate-800'
                      : 'text-slate-500 hover:bg-white/40'
                  }`}
                >
                  {isActive && (
                    <div 
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b ${item.gradient} rounded-r-full opacity-60`}
                    />
                  )}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isActive 
                      ? `bg-gradient-to-br ${item.gradient} shadow-sm opacity-80`
                      : 'bg-slate-50 group-hover:bg-slate-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{item.label}</div>
                    <div className="text-xs text-slate-400 truncate">{item.description}</div>
                  </div>
                  {isActive && (
                    <div className={`w-2 h-2 bg-gradient-to-br ${item.gradient} rounded-full opacity-60`}></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Interview Info */}
        <div className="mt-auto pt-6 border-t border-slate-200/50">
          <div className="p-4 bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-xl border border-slate-200/30">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Session</h4>
              <button className="text-slate-300 hover:text-slate-500">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <p className="font-bold text-slate-800 mb-1">Technical Interview</p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>March 22, 2026</span>
              <span>•</span>
              <span>42 min</span>
            </div>
          </div>
        </div>

        {/* Quick Action */}
        <button
          className="mt-4 w-full py-3.5 bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 text-white rounded-xl font-semibold shadow-md shadow-teal-400/20 hover:shadow-lg hover:shadow-teal-400/30 transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          Start New Interview
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Interview Analysis</h2>
              <p className="text-sm text-slate-600 flex items-center gap-2">
                Technical Interview • Score: <span className="font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">78/100</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-11 h-11 flex items-center justify-center rounded-xl bg-white shadow-sm hover:shadow-md border border-slate-200/50 transition-all relative group">
                <Bell className="w-5 h-5 text-slate-600 group-hover:text-teal-600 transition-colors" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full shadow-sm"></div>
              </button>
              <button className="w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md shadow-teal-500/20">
                <UserIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          </motion.div>

          {/* Dynamic Content */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}