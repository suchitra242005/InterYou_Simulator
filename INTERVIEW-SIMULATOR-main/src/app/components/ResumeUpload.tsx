import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  X,
  ArrowRight,
  AlertCircle,
  Loader2,
  ChevronLeft,
  LogOut,
  Sparkles
} from 'lucide-react';
import { apiService, Resume } from '../services/api';
import { toast } from 'sonner';

interface ResumeUploadProps {
  onContinue: (resume: Resume) => void;
  onBack: () => void;
  onLogout: () => void;
}

export function ResumeUpload({ onContinue, onBack, onLogout }: ResumeUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [resume, setResume] = useState<Resume | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    setUploadError('');
    
    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    // Simulate upload
    setIsUploading(true);
    setTimeout(() => {
      setUploadedFile(file);
      setIsUploading(false);
    }, 1500);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-10 shadow-sm">
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
              <button
                onClick={onBack}
                className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-sky-600 flex items-center gap-2 transition-colors rounded-lg hover:bg-sky-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
              <button
                onClick={onLogout}
                className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-red-600 flex items-center gap-2 transition-colors rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-16">
        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-sky-500/40">
                1
              </div>
              <span className="text-sm font-bold text-sky-600">Upload Resume</span>
            </div>
            <div className="w-20 h-1 bg-slate-200 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 text-sm font-bold">
                2
              </div>
              <span className="text-sm font-semibold text-slate-400">AI Analysis</span>
            </div>
            <div className="w-20 h-1 bg-slate-200 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 text-sm font-bold">
                3
              </div>
              <span className="text-sm font-semibold text-slate-400">Interview</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Upload Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-50 to-blue-50 px-5 py-2.5 rounded-full mb-5 border border-sky-200/60">
                <Sparkles className="w-5 h-5 text-sky-600" />
                <span className="text-sm font-bold text-sky-700">Step 1 of 3</span>
              </div>
              <h2 className="text-5xl font-bold text-slate-900 mb-4">
                Upload Your Resume
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Upload your PDF resume. Our AI will extract skills, experience, and education to generate personalized interview questions.
              </p>
            </div>

            {/* Upload Box */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-slate-200/80">
              <h3 className="font-bold text-slate-900 mb-6 text-lg">Resume Upload</h3>

              {/* Drag & Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-xl p-8 transition-all
                  ${isDragging 
                    ? 'border-sky-500 bg-sky-50/70' 
                    : uploadedFile 
                      ? 'border-emerald-400 bg-emerald-50/50'
                      : 'border-slate-300 bg-slate-50/70 hover:border-sky-400 hover:bg-sky-50/50'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <AnimatePresence mode="wait">
                  {isUploading ? (
                    <motion.div
                      key="uploading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <Loader2 className="w-12 h-12 text-sky-500 mx-auto mb-4 animate-spin" />
                      <p className="text-sm font-semibold text-slate-700">Uploading...</p>
                    </motion.div>
                  ) : uploadedFile ? (
                    <motion.div
                      key="uploaded"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/40">
                        <CheckCircle2 className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-slate-600 flex-shrink-0" />
                          <p className="text-sm font-bold text-slate-900 truncate">{uploadedFile.name}</p>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{formatFileSize(uploadedFile.size)}</p>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-all flex-shrink-0"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <Upload className="w-10 h-10 text-sky-600" />
                      </div>
                      <p className="text-base font-semibold text-slate-700 mb-2">
                        Drag & drop your resume here
                      </p>
                      <p className="text-sm text-slate-500 mb-5 font-medium">or</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-8 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-sky-500/40 hover:shadow-xl hover:scale-105 active:scale-95"
                      >
                        Choose File
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Error Message */}
              {uploadError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{uploadError}</p>
                </motion.div>
              )}

              {/* File Requirements */}
              <div className="mt-6 p-5 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl border border-slate-200/60">
                <p className="text-sm font-bold text-slate-800 mb-3">Supported formats:</p>
                <ul className="text-sm text-slate-600 space-y-1.5 font-medium">
                  <li>• PDF (.pdf) - Recommended</li>
                  <li>• Microsoft Word (.doc, .docx)</li>
                  <li>• Maximum file size: 10MB</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-3">
                <button
                  onClick={async () => {
                    if (!uploadedFile) return;
                    try {
                      setIsUploading(true);
                      const uploadedResume = await apiService.uploadResume(uploadedFile);
                      setResume(uploadedResume);
                      
                      toast.success('Resume uploaded! Analyzing with AI...');
                      
                      setIsParsing(true);
                      const parsedResume = await apiService.parseResume(uploadedResume._id);
                      setIsParsing(false);
                      
                      toast.success('Resume analyzed successfully!');
                      onContinue(parsedResume);
                    } catch (error) {
                      console.error('Resume upload failed:', error);
                      toast.error('Failed to upload resume. Please try again.');
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                  disabled={!uploadedFile || isUploading}
                  className={`
                    flex-1 px-8 py-5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 group
                    ${uploadedFile && !isUploading
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-xl shadow-sky-500/40 hover:shadow-2xl hover:scale-105 active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }
                  `}
                >
                  {(isUploading || isParsing) ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      {isParsing ? 'Analyzing with AI...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      Start Interview
                      <ArrowRight className={`w-6 h-6 ${uploadedFile ? 'group-hover:translate-x-1' : ''} transition-transform`} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Illustration & Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="sticky top-32">
              {/* Illustration */}
              
              {/* Info Cards */}
              <div className="space-y-5">
                <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-sky-200/60">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-sky-500/30">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2">AI-Powered Analysis</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Our AI extracts key information from your resume to create tailored interview questions
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-emerald-200/60">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2">100% Secure</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Your resume is encrypted and never shared with third parties
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}