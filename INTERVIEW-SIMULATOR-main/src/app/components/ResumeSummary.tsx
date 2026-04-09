import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, Edit, Sparkles, ArrowRight, ChevronLeft, LogOut,
  Mail, Phone, Linkedin, Globe, Briefcase, Target, GraduationCap,
  Award, Code, TrendingUp, FileText, CheckCircle, Loader2, User, Calendar, Star
} from 'lucide-react';
import { Resume, CreateInterviewData } from '../services/api';
import { apiService } from '../services/api';
import { toast } from 'sonner';

interface ResumeSummaryProps {
  resume: Resume | null;
  onContinue: (interviewId: string) => void;
  onBack: () => void;
  onLogout: () => void;
}

export function ResumeSummary({ resume, onContinue, onBack, onLogout }: ResumeSummaryProps) {
  const [targetCompany, setTargetCompany] = useState('');
  const [interviewType, setInterviewType] = useState<'technical' | 'behavioral' | 'mixed'>('mixed');
  const [targetRole, setTargetRole] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isScanning, setIsScanning] = useState(true);
  const [isCreatingInterview, setIsCreatingInterview] = useState(false);
  const [showAtsModal, setShowAtsModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsScanning(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const resumeData = resume?.parsedData ? {
    name: resume.parsedData.name || resume.fileName?.replace('.pdf', '') || 'Resume',
    email: resume.parsedData.email || '',
    phone: resume.parsedData.phone || '',
    linkedin: resume.parsedData.linkedin || '',
    portfolio: resume.parsedData.portfolio || '',
    skills: resume.parsedData.skills || [],
    technicalSkills: resume.parsedData.technicalSkills || [],
    softSkills: resume.parsedData.softSkills || [],
    experience: resume.parsedData.experience?.map((exp: any) => ({
      title: exp.position || exp.company || 'Experience',
      company: exp.company || '',
      description: exp.description || '',
      duration: exp.duration || '',
      isCurrent: exp.isCurrent || false,
    })) || [],
    internships: resume.parsedData.internships?.map((intern: any) => ({
      title: intern.position || intern.company || 'Internship',
      company: intern.company || '',
      description: intern.description || '',
      duration: intern.duration || '',
      startDate: intern.startDate || '',
      endDate: intern.endDate || '',
    })) || [],
    projects: resume.parsedData.projects || [],
    education: resume.parsedData.education || [],
    certifications: resume.parsedData.certifications || [],
    languages: resume.parsedData.languages || [],
    summary: resume.parsedData.summary || '',
    isFresher: resume.parsedData.isFresher || false,
    atsScore: (resume as any).atsScore || 0,
    atsFeedback: (resume as any).atsFeedback || { strengths: [], weaknesses: [], overall: '' },
    suggestions: (resume as any).suggestions || [],
  } : { name: 'Resume', email: '', phone: '', linkedin: '', portfolio: '', skills: [], technicalSkills: [], softSkills: [], experience: [], internships: [], projects: [], education: [], certifications: [], languages: [], summary: '', isFresher: false, atsScore: 0, atsFeedback: { strengths: [], weaknesses: [], overall: '' }, suggestions: [] };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <AnimatePresence>
        {isScanning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex items-center justify-center">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Resume</h3>
              <p className="text-slate-600">Extracting skills, experience & education...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent">Inter<span className="bg-gradient-to-r from-teal-500 to-emerald-400 bg-clip-text text-transparent">You</span></h1>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg flex items-center gap-2"><ChevronLeft className="w-4 h-4" />Back</button>
              <button onClick={onLogout} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"><LogOut className="w-4 h-4" />Logout</button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-50 to-emerald-50 px-5 py-2 rounded-full border border-teal-200/50 mb-6"><Sparkles className="w-5 h-5 text-teal-600" /><span className="text-sm font-semibold text-teal-700">AI-Powered Analysis</span></div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Resume <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Summary</span></h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Your resume has been analyzed. Review your profile and set up your interview preferences below.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"><User className="w-10 h-10 text-white" /></div>
                  <div className="text-white">
                    <h3 className="text-2xl font-bold">{resumeData.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-white/80 text-sm">
                      {resumeData.email && <div className="flex items-center gap-1"><Mail className="w-4 h-4" /><span>{resumeData.email}</span></div>}
                      {resumeData.phone && <div className="flex items-center gap-1"><Phone className="w-4 h-4" /><span>{resumeData.phone}</span></div>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-6">
                {resumeData.summary && <div><h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Professional Summary</h4><p className="text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4">{resumeData.summary}</p></div>}
                <div>
                  <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center"><Code className="w-4 h-4 text-white" /></div><h4 className="font-bold text-slate-900">Skills & Expertise</h4></div>
                  {resumeData.technicalSkills.length > 0 && <div className="flex flex-wrap gap-2">{resumeData.technicalSkills.map((skill, i) => <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/50 text-teal-700 text-sm font-medium rounded-lg">{skill}</span>)}</div>}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center"><Briefcase className="w-4 h-4 text-white" /></div><h4 className="font-bold text-slate-900">Experience</h4></div>
                  {resumeData.experience.length > 0 ? resumeData.experience.map((exp, i) => <div key={i} className="p-4 bg-slate-50 rounded-xl"><h5 className="font-semibold text-slate-900">{exp.title}</h5><p className="text-sm text-slate-600">{exp.company} | {exp.duration}</p></div>) : <div className="p-4 bg-slate-50 rounded-xl"><span className="text-teal-600 font-semibold">Fresher</span><p className="text-sm text-slate-600">No work experience yet</p></div>}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center"><GraduationCap className="w-4 h-4 text-white" /></div><h4 className="font-bold text-slate-900">Education</h4></div>
                  {resumeData.education.map((edu, i) => <div key={i} className="p-4 bg-slate-50 rounded-xl"><h5 className="font-semibold text-slate-900">{edu.degree} {edu.field && `in ${edu.field}`}</h5><p className="text-sm text-slate-600">{edu.institution} | {edu.year}</p></div>)}
                </div>
              </div>
            </div>
          </motion.div>

          {resumeData.atsScore > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-1 space-y-6">
              <button onClick={() => setShowAtsModal(true)} className="w-full bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6 flex items-center justify-between hover:shadow-xl transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-white" /></div>
                  <div className="text-left"><h3 className="font-bold text-slate-900 text-lg">ATS Score & Analysis</h3><p className="text-slate-500 text-sm">View resume evaluation</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right"><span className={`text-2xl font-bold ${resumeData.atsScore >= 70 ? 'text-emerald-600' : resumeData.atsScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{resumeData.atsScore}</span><span className="text-slate-400 text-sm">/100</span></div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-5">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"><Target className="w-5 h-5 text-white" /></div><div><h3 className="font-bold text-white text-lg">Interview Setup</h3><p className="text-white/70 text-sm">Customize your session</p></div></div>
                </div>
                <div className="p-6 space-y-5">
                  <div><label className="block text-sm font-semibold text-slate-700 mb-2">Target Company</label><div className="relative"><Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" value={targetCompany} onChange={e => setTargetCompany(e.target.value)} placeholder="e.g., Google" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div></div>
                  <div><label className="block text-sm font-semibold text-slate-700 mb-2">Target Role</label><div className="relative"><Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g., Software Engineer" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div></div>
                  <div><label className="block text-sm font-semibold text-slate-700 mb-2">Interview Type</label><select value={interviewType} onChange={e => setInterviewType(e.target.value as any)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"><option value="technical">Technical</option><option value="behavioral">Behavioral</option><option value="mixed">Mixed</option></select></div>
                  <div><label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty</label><select value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
                  <div><label className="block text-sm font-semibold text-slate-700 mb-2">Number of Questions</label><input type="number" min="3" max="10" value={numQuestions} onChange={e => setNumQuestions(parseInt(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
                  <button onClick={async () => { if (!targetCompany.trim() || !targetRole.trim()) { toast.error('Please enter a company and role.'); return; } if (!resume) { toast.error('Resume not loaded.'); return; } try { setIsCreatingInterview(true); const interview = await apiService.createInterview({ resumeId: resume._id, company: targetCompany, role: targetRole, interviewType, difficulty, questionCount: numQuestions }); await apiService.generateQuestions(interview._id); toast.success('Interview created!'); onContinue(interview._id); } catch (error) { toast.error('Failed to create interview.'); } finally { setIsCreatingInterview(false); } }} disabled={isCreatingInterview || !resume} className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">{isCreatingInterview ? <><Loader2 className="w-5 h-5 animate-spin" />Setting up...</> : <>Start Interview<ArrowRight className="w-5 h-5" /></>}</button>
                  <p className="text-xs text-center text-slate-500">Questions will be tailored based on your resume</p>
                </div>
              </div>
            </motion.div>
          )}

          {!resumeData.atsScore && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden sticky top-28">
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-5">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"><Target className="w-5 h-5 text-white" /></div><div><h3 className="font-bold text-white text-lg">Interview Setup</h3><p className="text-white/70 text-sm">Customize your session</p></div></div>
                </div>
                <div className="p-6 space-y-5">
                  <div><label className="block text-sm font-semibold text-slate-700 mb-2">Target Company</label><div className="relative"><Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" value={targetCompany} onChange={e => setTargetCompany(e.target.value)} placeholder="e.g., Google" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div></div>
                  <div><label className="block text-sm font-semibold text-slate-700 mb-2">Target Role</label><div className="relative"><Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g., Software Engineer" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" /></div></div>
                  <div><label className="block text-sm font-semibold text-slate-700 mb-2">Interview Type</label><select value={interviewType} onChange={e => setInterviewType(e.target.value as any)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"><option value="technical">Technical</option><option value="behavioral">Behavioral</option><option value="mixed">Mixed</option></select></div>
                  <div><label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty</label><select value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
                  <div><label className="block text-sm font-semibold text-slate-700 mb-2">Number of Questions</label><input type="number" min="3" max="10" value={numQuestions} onChange={e => setNumQuestions(parseInt(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
                  <button onClick={async () => { if (!targetCompany.trim() || !targetRole.trim()) { toast.error('Please enter a company and role.'); return; } if (!resume) { toast.error('Resume not loaded.'); return; } try { setIsCreatingInterview(true); const interview = await apiService.createInterview({ resumeId: resume._id, company: targetCompany, role: targetRole, interviewType, difficulty, questionCount: numQuestions }); await apiService.generateQuestions(interview._id); toast.success('Interview created!'); onContinue(interview._id); } catch (error) { toast.error('Failed to create interview.'); } finally { setIsCreatingInterview(false); } }} disabled={isCreatingInterview || !resume} className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">{isCreatingInterview ? <><Loader2 className="w-5 h-5 animate-spin" />Setting up...</> : <>Start Interview<ArrowRight className="w-5 h-5" /></>}</button>
                  <p className="text-xs text-center text-slate-500">Questions will be tailored based on your resume</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {showAtsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAtsModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">ATS Score & Analysis</h3>
              <button onClick={() => setShowAtsModal(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-slate-900">{resumeData.atsScore}</div>
                <div className="text-slate-500 text-sm mt-1">ATS Score</div>
              </div>
              <div className="mb-4">
                <h4 className="font-bold text-emerald-700 mb-2">Strengths</h4>
                <ul className="text-sm text-slate-600 space-y-1">{resumeData.atsFeedback.strengths?.slice(0,4).map((s,i) => <li key={i}>• {s}</li>)}</ul>
              </div>
              <div className="mb-4">
                <h4 className="font-bold text-red-700 mb-2">Areas to Improve</h4>
                <ul className="text-sm text-slate-600 space-y-1">{resumeData.atsFeedback.weaknesses?.slice(0,4).map((w,i) => <li key={i}>• {w}</li>)}</ul>
              </div>
              {resumeData.suggestions?.length > 0 && (<div><h4 className="font-bold text-slate-900 mb-2">AI Suggestions</h4><ul className="text-sm text-slate-600 space-y-1">{resumeData.suggestions.slice(0,5).map((s,i) => <li key={i}>{i+1}. {s}</li>)}</ul></div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}