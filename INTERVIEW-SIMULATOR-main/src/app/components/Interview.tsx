import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import Editor from '@monaco-editor/react';
import { ChevronLeft, ChevronRight, LogOut, Play, Square, Loader2, Video, Mic, MessageSquare, Award, Sparkles, Target, Clock, User, Volume2, VolumeX, Code, Eye, Send, CheckCircle, RefreshCw, Brain, TrendingUp, TrendingDown, AlertCircle, BookOpen, Camera, CameraOff } from 'lucide-react';
import { InterviewResults } from './InterviewResults';
import CameraPreview from './CameraPreview';
import { apiService, Resume, Interview as InterviewType, Question } from '../services/api';
import { avatarService } from '../services/avatarService';
import { toast } from 'sonner';
import { useFaceDetection } from '../hooks/useFaceDetection';

interface InterviewQuestion {
  text: string;
  category: string;
  type: 'technical' | 'behavioral' | 'coding' | 'case_study' | 'hr';
  expectedDuration?: number;
  difficulty?: number;
  focus?: string;
  isIntro?: boolean;
  questionId?: string;
}

interface InterviewState {
  currentQuestionIndex: number;
  askedQuestions: string[];
  performanceHistory: number[];
  difficultyLevel: number;
  questionTypesAsked: string[];
}

interface InterviewProps {
  resume: Resume | null;
  interviewId: string | null;
  onBack: () => void;
  onLogout: () => void;
}

interface AIFeedback {
  correctness: number;
  confidence: number;
  fluency?: number;
  clarity: number;
  eyeContact: number;
  bodyLanguage: number;
  overallScore: number;
  feedback: string;
  suggestions: string[];
  sampleAnswer?: string;
  nextDifficulty?: 'increase' | 'same' | 'decrease';
}

interface CodeEvaluation {
  correctness: number;
  efficiency: number;
  codeQuality: number;
  edgeCases: number;
  overallScore: number;
  feedback: string;
  suggestions: string[];
}

export function Interview({ resume, interviewId, onBack, onLogout }: InterviewProps) {
  const [interview, setInterview] = useState<InterviewType | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [questionTime, setQuestionTime] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessingFeedback, setIsProcessingFeedback] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [codeEvaluation, setCodeEvaluation] = useState<CodeEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [eyeContactScore, setEyeContactScore] = useState(50);
  const [introText, setIntroText] = useState('');
  const [performanceHistory, setPerformanceHistory] = useState<number[]>([]);
  const [currentDifficulty, setCurrentDifficulty] = useState<number>(5);
  const [allFeedback, setAllFeedback] = useState<any[]>([]);
  
  // Time management
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTimeUsed, setTotalTimeUsed] = useState(0);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  
  // Progress tracking
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [totalQuestionsToAnswer, setTotalQuestionsToAnswer] = useState(0);
  
  const [interviewState, setInterviewState] = useState<InterviewState>({
    currentQuestionIndex: 0,
    askedQuestions: [],
    performanceHistory: [],
    difficultyLevel: 5,
    questionTypesAsked: []
  });
  
  const [questionStats, setQuestionStats] = useState({
    technical: 0,
    behavioral: 0,
    coding: 0,
    case_study: 0,
    hr: 0
  });

  // Recording state
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [showReplayModal, setShowReplayModal] = useState(false);

  const {
    eyeContact: realEyeContact,
    faceDetected,
    startDetection: startFaceDetection,
    stopDetection: stopFaceDetection,
    isDetecting: isFaceDetecting,
    isLoading: isFaceLoading,
    error: faceError
  } = useFaceDetection();

  const [useRealFaceDetection, setUseRealFaceDetection] = useState(true);
  const [showDetectionToggle, setShowDetectionToggle] = useState(false);

  const [lastAnswerQuality, setLastAnswerQuality] = useState<'excellent' | 'good' | 'average' | 'poor' | null>(null);
  const [followUpActive, setFollowUpActive] = useState(false);
  const [currentFollowUp, setCurrentFollowUp] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const eyeTrackingRef = useRef<NodeJS.Timeout | null>(null);

  const totalQuestions = questions.length;
  const currentQ = questions[currentQuestion];

  const getDifficultyLabel = (level: number): string => {
    if (level <= 3) return 'Beginner';
    if (level <= 6) return 'Intermediate';
    return 'Advanced';
  };

  const getNextQuestionType = useCallback((): string => {
    const typeCounts = questionStats;
    const total = Object.values(typeCounts).reduce((a, b) => a + b, 0);
    
    if (total === 0) return 'behavioral';
    
    const weights: Record<string, number> = {
      behavioral: total > 0 ? Math.max(1, 3 - typeCounts.behavioral) : 3,
      technical: total > 0 ? Math.max(1, 3 - typeCounts.technical) : 3,
      coding: total > 0 ? Math.max(1, 2 - typeCounts.coding) : 2,
      case_study: total > 0 ? Math.max(1, 2 - typeCounts.case_study) : 2,
      hr: total > 0 ? Math.max(1, 1 - typeCounts.hr) : 1
    };
    
    const available = Object.entries(weights)
      .filter(([_, weight]) => weight > 0)
      .map(([type, weight]) => ({ type, weight }));
    
    if (available.length === 0) return 'behavioral';
    
    const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of available) {
      random -= item.weight;
      if (random <= 0) return item.type;
    }
    
    return available[0].type;
  }, [questionStats]);

  useEffect(() => {
    loadInterview();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (eyeTrackingRef.current) clearInterval(eyeTrackingRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      avatarService.stop();
    };
  }, []);

  // Timer and time management
  useEffect(() => {
    if (hasStarted && isRecording) {
      timerRef.current = setInterval(() => {
        setQuestionTime(prev => {
          const newTime = prev + 1;
          setTotalTimeUsed(t => t + 1);
          
          // Check if approaching time limit
          const expectedDuration = currentQ?.expectedDuration || 180;
          const timeLeft = expectedDuration - newTime;
          
          // Show warning at 25% and 10% time remaining
          if (timeLeft > 0 && timeLeft <= expectedDuration * 0.25 && timeLeft > expectedDuration * 0.1) {
            setShowTimeWarning(true);
          } else if (timeLeft > 0 && timeLeft <= expectedDuration * 0.1) {
            setShowTimeWarning(true);
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasStarted, isRecording, currentQ]);

  // Reset timer when question changes
  useEffect(() => {
    if (currentQ && hasStarted) {
      setTimeRemaining(currentQ.expectedDuration || 180);
      setShowTimeWarning(false);
    }
  }, [currentQuestion, currentQ, hasStarted]);

  useEffect(() => {
    if (hasStarted && isIntroComplete && cameraStream) {
      startEyeTracking();
    }
    return () => {
      if (eyeTrackingRef.current) clearInterval(eyeTrackingRef.current);
    };
  }, [hasStarted, isIntroComplete, cameraStream]);

  // Connect camera stream to video element
  useEffect(() => {
    if (cameraStream && userVideoRef.current) {
      userVideoRef.current.srcObject = cameraStream;
      userVideoRef.current.play().catch(console.error);
    }
  }, [cameraStream]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCameraStream(stream);
      toast.success('Camera & mic enabled!');
    } catch (err) {
      toast.error('Failed to enable camera');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const startEyeTracking = async () => {
    if (!cameraStream || !userVideoRef.current) return;
    
    if (useRealFaceDetection) {
      try {
        await startFaceDetection(userVideoRef.current);
        toast.success('Face detection enabled - monitoring eye contact');
      } catch (err) {
        console.error('Face detection failed:', err);
        toast.warning('Face detection unavailable, using simulation');
        startSimulationEyeTracking();
      }
    } else {
      startSimulationEyeTracking();
    }
  };

  const startSimulationEyeTracking = () => {
    let currentEyeScore = 75;
    
    eyeTrackingRef.current = setInterval(() => {
      const randomChange = Math.random() * 30 - 15;
      
      if (isRecording) {
        currentEyeScore = currentEyeScore + (randomChange * 1.5);
      } else {
        currentEyeScore = currentEyeScore + randomChange;
      }
      
      currentEyeScore = Math.min(95, Math.max(20, currentEyeScore));
      setEyeContactScore(Math.round(currentEyeScore));
    }, 1500);
  };

  // Sync real face detection with eye contact score
  useEffect(() => {
    if (useRealFaceDetection) {
      if (faceDetected && realEyeContact >= 0) {
        // Face detected, update score (even if 0)
        setEyeContactScore(realEyeContact > 0 ? realEyeContact : 50);
      } else if (!faceDetected && isFaceDetecting) {
        // No face detected consistently
        setEyeContactScore(0);
      }
    }
  }, [realEyeContact, faceDetected, isFaceDetecting, useRealFaceDetection]);

  // Cleanup face detection when stopping
  useEffect(() => {
    return () => {
      stopFaceDetection();
    };
  }, []);

  const loadInterview = async () => {
    try {
      setIsLoading(true);
      if (interviewId) {
        const interview = await apiService.getInterview(interviewId);
        if (interview) {
          setInterview(interview);
          if (interview.questions && interview.questions.length > 0) {
            const processedQuestions = interview.questions.map((q: any, idx: number) => ({
              ...q,
              questionId: q.questionId || `q_${idx}_${Date.now()}`
            }));
            setQuestions(processedQuestions);
            
            const initialState: InterviewState = {
              currentQuestionIndex: 0,
              askedQuestions: [],
              performanceHistory: [],
              difficultyLevel: interview.difficulty === 'easy' ? 3 : interview.difficulty === 'hard' ? 8 : 5,
              questionTypesAsked: []
            };
            setInterviewState(initialState);
            setCurrentDifficulty(initialState.difficultyLevel);
          }
          const intro = await apiService.getIntroduction(interviewId);
          if (intro?.introduction) {
            setIntroText(intro.introduction);
          }
        }
      } else {
        const interviews = await apiService.getInterviews();
        if (interviews && interviews.length > 0) {
          const latestInterview = interviews[0];
          setInterview(latestInterview);
          if (latestInterview.questions) {
            const processedQuestions = latestInterview.questions.map((q: any, idx: number) => ({
              ...q,
              questionId: q.questionId || `q_${idx}_${Date.now()}`
            }));
            setQuestions(processedQuestions);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load interview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isQuestionAsked = useCallback((questionText: string): boolean => {
    return interviewState.askedQuestions.some(
      asked => asked.toLowerCase().trim() === questionText.toLowerCase().trim()
    );
  }, [interviewState.askedQuestions]);

  const trackQuestionAsked = useCallback((question: InterviewQuestion) => {
    setInterviewState(prev => ({
      ...prev,
      askedQuestions: [...prev.askedQuestions, question.text],
      questionTypesAsked: [...prev.questionTypesAsked, question.type]
    }));
    
    setQuestionStats(prev => ({
      ...prev,
      [question.type]: (prev[question.type as keyof typeof prev] || 0) + 1
    }));
  }, []);

  const startInterview = async () => {
    if (!cameraStream) {
      toast.error('Please enable camera first!');
      return;
    }
    const firstQ = questions[0];
    setHasStarted(true);
    setIsIntroComplete(true); // Directly show intro question
    setCurrentQuestion(0); // Question 0 = Introduction
    setQuestionTime(0);
    setTranscript('');
    setAiFeedback(null);
    setTotalQuestionsToAnswer(totalQuestions); // Include intro in count
    setQuestionsAnswered(0);
    setTotalTimeUsed(0);
    setTimeRemaining(firstQ?.expectedDuration || 180);
    
    toast.info('🎤 Introduce yourself! Tell the interviewer about your background and skills.');
    
    // Speak what's shown on screen (the intro question from questions array)
    if (firstQ?.text) {
      setTimeout(() => speakQuestion(true, firstQ.text), 500);
    }
  };

  const speakText = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      setIsSpeaking(true);
      avatarService.speak(
        text,
        () => setIsSpeaking(true),
        () => {
          setIsSpeaking(false);
          resolve();
        }
      );
    });
  };

  const startRecording = async () => {
    // Start video recording if camera is available
    if (cameraStream && !mediaRecorder) {
      try {
        const recorder = new MediaRecorder(cameraStream, {
          mimeType: 'video/webm;codecs=vp9'
        });
        
        const chunks: Blob[] = [];
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);
        };
        
        recorder.start(1000); // Capture every second
        setMediaRecorder(recorder);
        setIsVideoRecording(true);
      } catch (err) {
        console.error('Video recording error:', err);
      }
    }
    
    // Start speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    let finalTranscript = '';

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      setTranscript(finalTranscript + interimTranscript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast.error('Speech recognition error');
    };

    recognitionRef.current.onend = () => {
      if (isRecording) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
        }
      }
    };

    recognitionRef.current.start();
    setIsRecording(true);
    setQuestionTime(0);
    toast.info('Recording started... Speak your answer!');

    // Clear previous recording
    setRecordedChunks([]);
    setRecordedVideoUrl(null);
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    
    // Stop video recording
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsVideoRecording(false);
    }
    
    toast.info('Recording stopped. Processing your answer...');
    
    await generateFeedback();
  };

  const determineAnswerQuality = (score: number): 'excellent' | 'good' | 'average' | 'poor' => {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'average';
    return 'poor';
  };

  const generateFollowUpQuestion = (question: InterviewQuestion, answer: string, quality: string): string | null => {
    const answerLength = answer.length;
    const hasSTAR = /situation|task|action|result|worked|built|developed|created|solved/i.test(answer);
    const hasNumbers = /\d+%|increased|decreased|managed|team|project/i.test(answer);
    
    if (quality === 'excellent' && question.type === 'behavioral') {
      const followUps = [
        "Can you tell me more about the specific challenges you faced during that?",
        "What was the most difficult part of that experience and how did you overcome it?",
        "What would you do differently if you faced a similar situation again?"
      ];
      return followUps[Math.floor(Math.random() * followUps.length)];
    }
    
    if (quality === 'average' && question.type === 'technical') {
      return "Can you provide a more specific example from your experience?";
    }
    
    if (answerLength < 50 && !hasSTAR) {
      return "Could you please elaborate more on that? I'd like to hear more details.";
    }
    
    if (!hasNumbers && question.type === 'behavioral') {
      return "What was the measurable impact or result of your actions?";
    }
    
    return null;
  };

  const generateFeedback = async () => {
    if (!transcript.trim() || !interviewId) return;
    
    setIsProcessingFeedback(true);
    try {
      const feedback = await apiService.getFeedback(
        interviewId,
        currentQuestion,
        transcript,
        undefined,
        { eyeContact: eyeContactScore, attentiveness: eyeContactScore }
      );
      setAiFeedback(feedback);
      
      const quality = determineAnswerQuality(feedback?.overallScore || 50);
      setLastAnswerQuality(quality);
      
      if (feedback?.overallScore) {
        const newHistory = [...performanceHistory, feedback.overallScore];
        setPerformanceHistory(newHistory);
        
        setInterviewState(prev => ({
          ...prev,
          performanceHistory: newHistory
        }));
        
        const questionFeedback = {
          question: currentQ?.text || '',
          questionType: currentQ?.type || 'behavioral',
          category: currentQ?.category || 'General',
          questionId: currentQ?.questionId,
          answer: transcript,
          difficulty: currentQ?.difficulty || currentDifficulty,
          answerQuality: quality,
          correctness: feedback.correctness,
          confidence: feedback.confidence,
          clarity: feedback.clarity,
          eyeContact: feedback.eyeContact,
          bodyLanguage: feedback.bodyLanguage,
          overallScore: feedback.overallScore,
          feedback: feedback.feedback,
          suggestions: feedback.suggestions,
          sampleAnswer: feedback.sampleAnswer,
          timestamp: new Date().toISOString()
        };
        setAllFeedback(prev => [...prev, questionFeedback]);
        
        const avgScore = newHistory.reduce((a, b) => a + b, 0) / newHistory.length;
        
        let newDifficulty = currentDifficulty;
        if (feedback.nextDifficulty === 'increase' || avgScore >= 80) {
          newDifficulty = Math.min(10, currentDifficulty + 1);
          setCurrentDifficulty(newDifficulty);
          toast.success('Excellent performance! Increasing difficulty level.');
        } else if (feedback.nextDifficulty === 'decrease' || avgScore < 45) {
          newDifficulty = Math.max(1, currentDifficulty - 1);
          setCurrentDifficulty(newDifficulty);
          toast.info('Adjusting to easier level. Keep practicing!');
        }
        
        const followUp = generateFollowUpQuestion(currentQ, transcript, quality);
        if (followUp) {
          setCurrentFollowUp(followUp);
          setFollowUpActive(true);
        }
      }
    } catch (err) {
      const questionFeedback = {
        question: currentQ?.text || '',
        questionType: currentQ?.type || 'behavioral',
        category: currentQ?.category || 'General',
        questionId: currentQ?.questionId,
        answer: transcript,
        difficulty: currentQ?.difficulty || currentDifficulty,
        answerQuality: 'average',
        correctness: 60,
        confidence: 65,
        clarity: 60,
        eyeContact: eyeContactScore,
        bodyLanguage: 65,
        overallScore: 62,
        feedback: 'Your answer needs more specific examples.',
        suggestions: ['Use STAR method', 'Be more specific', 'Maintain eye contact'],
        sampleAnswer: 'A strong answer would directly address the question with specific examples.',
        timestamp: new Date().toISOString()
      };
      setAllFeedback(prev => [...prev, questionFeedback]);
      console.error('Failed to get feedback:', err);
      setAiFeedback({
        correctness: 70,
        confidence: 75,
        clarity: 70,
        eyeContact: eyeContactScore,
        bodyLanguage: 75,
        overallScore: 72,
        feedback: 'Good attempt! Try to be more specific with examples.',
        suggestions: ['Use the STAR method for behavioral questions', 'Maintain better eye contact', 'Be more confident'],
        nextDifficulty: 'same'
      });
    } finally {
      setIsProcessingFeedback(false);
    }
  };

  const submitCode = async () => {
    if (!code.trim() || !interviewId) return;
    
    setIsEvaluating(true);
    try {
      const evaluation = await apiService.evaluateCodeAI(interviewId, code, language, currentQuestion);
      setCodeEvaluation(evaluation);
      
      if (evaluation?.overallScore) {
        const newHistory = [...performanceHistory, evaluation.overallScore];
        setPerformanceHistory(newHistory);
        
        // Store code feedback
        const questionFeedback = {
          question: currentQ?.text || '',
          questionType: 'coding',
          category: currentQ?.category || 'Coding',
          answer: code,
          correctness: evaluation.correctness,
          confidence: evaluation.efficiency,
          clarity: evaluation.codeQuality,
          eyeContact: evaluation.edgeCases,
          bodyLanguage: evaluation.codeQuality,
          overallScore: evaluation.overallScore,
          feedback: evaluation.feedback,
          suggestions: evaluation.suggestions,
          sampleAnswer: 'A complete solution would handle all edge cases with optimal time complexity.'
        };
        setAllFeedback(prev => [...prev, questionFeedback]);
        
        const avgScore = newHistory.reduce((a, b) => a + b, 0) / newHistory.length;
        
        if (evaluation.nextDifficulty === 'increase' || avgScore >= 75) {
          setCurrentDifficulty(prev => Math.min(10, prev + 1));
          toast.success('Great coding! Next question will be slightly harder.');
        } else if (evaluation.nextDifficulty === 'decrease' || avgScore < 50) {
          setCurrentDifficulty(prev => Math.max(1, prev - 1));
          toast.info('Next coding question adjusted to easier level.');
        }
      }
    } catch (err) {
      console.error('Failed to evaluate code:', err);
      setCodeEvaluation({
        correctness: 60,
        efficiency: 60,
        codeQuality: 60,
        edgeCases: 50,
        overallScore: 58,
        feedback: 'Code submitted. Consider edge cases and optimization.',
        suggestions: ['Handle edge cases', 'Optimize complexity', 'Add comments']
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const speakQuestion = async (auto: boolean = false, questionText?: string) => {
    const textToSpeak = questionText || currentQ?.text;
    if (!textToSpeak) return;
    
    if (isSpeaking && !auto) {
      avatarService.stop();
      setIsSpeaking(false);
    } else if (!isSpeaking || auto) {
      setIsSpeaking(true);
      avatarService.speak(
        textToSpeak,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  const toggleSpeak = () => speakQuestion(false);

  const nextQuestion = (autoSpeak: boolean = true) => {
    avatarService.stop();
    setIsSpeaking(false);
    setCode('');
    setCodeEvaluation(null);
    setShowTimeWarning(false);
    
    // If on intro question (index 0), move to first actual question
    if (currentQuestion === 0) {
      const nextQ = questions[1];
      setCurrentQuestion(1);
      setQuestionTime(0);
      setTimeRemaining(nextQ?.expectedDuration || 180);
      setTranscript('');
      setAiFeedback(null);
      setQuestionsAnswered(prev => prev + 1);
      
      // Auto-show code editor for coding questions (including Q1)
      if (nextQ?.type === 'coding') {
        setShowCodeEditor(true);
        toast.info('💻 Coding question! Write your code below.');
      } else {
        setShowCodeEditor(false);
      }
      
      toast.success('Introduction complete! Now starting resume-based questions');
      // Speak the NEXT question after state is updated - pass text directly
      if (autoSpeak && nextQ) {
        setTimeout(() => speakQuestion(true, nextQ.text), 800);
      }
    } else if (currentQuestion < totalQuestions - 1) {
      const nextQ = questions[currentQuestion + 1];
      setCurrentQuestion(currentQuestion + 1);
      setQuestionTime(0);
      setTimeRemaining(nextQ?.expectedDuration || 180);
      setTranscript('');
      setAiFeedback(null);
      setQuestionsAnswered(prev => prev + 1);
      
      // Auto-show code editor for coding questions
      if (nextQ?.type === 'coding') {
        setShowCodeEditor(true);
        toast.info('💻 Coding question! Write your code below.');
      } else {
        setShowCodeEditor(false);
      }
      
      toast.info(`Question ${currentQuestion} of ${totalQuestions - 1}`);
      // Speak the NEXT question after state is updated - pass text directly
      if (autoSpeak && nextQ) {
        setTimeout(() => speakQuestion(true, nextQ.text), 800);
      }
    } else {
      finishInterview();
    }
  };

  const finishInterview = () => {
    avatarService.stop();
    setIsSpeaking(false);
    setShowResults(true);
    toast.success('Interview completed!');
  };

  const renderScoreCircle = (score: number, label: string, color: string) => (
    <div className="flex flex-col items-center">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color}`}>
        <span className="text-lg font-bold text-white">{score}</span>
      </div>
      <span className="text-xs text-slate-600 mt-1">{label}</span>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <InterviewResults 
        onBack={() => { stopCamera(); avatarService.stop(); setShowResults(false); }} 
        onLogout={onLogout}
        interview={interview}
        feedbackData={{
          questions: allFeedback,
          correctness: allFeedback.length > 0 ? Math.round(allFeedback.reduce((a, b) => a + b.correctness, 0) / allFeedback.length) : 65,
          confidence: allFeedback.length > 0 ? Math.round(allFeedback.reduce((a, b) => a + b.confidence, 0) / allFeedback.length) : 70,
          clarity: allFeedback.length > 0 ? Math.round(allFeedback.reduce((a, b) => a + b.clarity, 0) / allFeedback.length) : 68,
          eyeContact: allFeedback.length > 0 ? Math.round(allFeedback.reduce((a, b) => a + b.eyeContact, 0) / allFeedback.length) : 75,
          bodyLanguage: allFeedback.length > 0 ? Math.round(allFeedback.reduce((a, b) => a + b.bodyLanguage, 0) / allFeedback.length) : 75,
        }}
        performanceHistory={performanceHistory}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Navbar */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { stopCamera(); avatarService.stop(); onBack(); }} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Inter<span className="bg-gradient-to-r from-teal-500 to-emerald-400 bg-clip-text text-transparent">You</span>
              </h1>
            </div>
            {interview && (
              <div className="flex items-center gap-1.5 ml-3 px-2 py-1 bg-slate-100 rounded-full">
                <Target className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-700">{interview.role}</span>
                <span className="text-slate-400">@</span>
                <span className="text-xs font-medium text-slate-900">{interview.company}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {hasStarted && isIntroComplete && performanceHistory.length > 0 && (
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${
                performanceHistory.reduce((a,b) => a+b,0)/performanceHistory.length >= 70 
                  ? 'bg-green-100 text-green-700' 
                  : performanceHistory.reduce((a,b) => a+b,0)/performanceHistory.length >= 50
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                <Award className="w-3 h-3" />
                Avg: {Math.round(performanceHistory.reduce((a,b) => a+b,0)/performanceHistory.length)}
              </div>
            )}
            {hasStarted && isIntroComplete && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg font-mono text-sm font-bold ${
                isRecording ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
              }`}>
                <Clock className="w-4 h-4" />
                {formatTime(questionTime)}
                {isRecording && <span className="text-xs">● REC</span>}
              </div>
            )}
            {recordedVideoUrl && (
              <button 
                onClick={() => setShowReplayModal(true)}
                className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200"
              >
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Replay
              </button>
            )}
            <button onClick={onLogout} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <LogOut className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-50px)]">
        
        {/* LEFT SIDE - User & Avatar Side by Side */}
        <div className="w-[55%] p-3 flex flex-col gap-3">
          {/* User & Avatar Side by Side */}
          <div className="flex-1 flex gap-3">
            {/* Avatar Box */}
            <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg border border-slate-700/50 overflow-hidden flex flex-col">
              <div className="bg-slate-700/50 px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Virtual HR</span>
                <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-4xl font-bold text-white">HR</span>
                  </div>
                  <p className="text-white font-medium">Mr. James</p>
                  <p className="text-slate-400 text-xs mt-1">AI Assistant</p>
                  {isSpeaking && (
                    <div className="flex justify-center gap-1 mt-2">
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Camera Box */}
            <div className="flex-1 bg-black rounded-2xl shadow-lg border border-slate-700/50 overflow-hidden flex flex-col relative">
              <div className="bg-black/50 px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">You</span>
                {isRecording && (
                  <div className="flex items-center gap-1.5 bg-red-500 px-2 py-0.5 rounded-full">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-white text-xs font-bold">REC</span>
                  </div>
                )}
              </div>
              <div className="flex-1 relative">
                {cameraStream ? (
                  <>
                    <video 
                      ref={userVideoRef}
                      autoPlay 
                      muted 
                      playsInline 
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    {hasStarted && isIntroComplete && (
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg flex items-center gap-2 ${
                        faceDetected 
                          ? (eyeContactScore >= 70 ? 'bg-green-500/80' : eyeContactScore >= 50 ? 'bg-yellow-500/80' : 'bg-red-500/80')
                          : 'bg-red-600/90'
                      }`}>
                        {faceDetected ? (
                          <Eye className="w-3 h-3 text-white" />
                        ) : (
                          <CameraOff className="w-3 h-3 text-white" />
                        )}
                        <span className="text-xs font-bold text-white">
                          {faceDetected ? `${eyeContactScore}%` : 'No Face'}
                        </span>
                        <button
                          onClick={() => {
                            if (useRealFaceDetection) {
                              setUseRealFaceDetection(false);
                              stopFaceDetection();
                              startSimulationEyeTracking();
                              toast.info('Simulation mode');
                            } else {
                              setUseRealFaceDetection(true);
                              if (userVideoRef.current) startEyeTracking();
                              toast.success('Camera detection');
                            }
                          }}
                          className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-[10px] text-white"
                        >
                          {useRealFaceDetection ? 'AI' : 'Sim'}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <User className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-500 text-xs">Camera off</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="h-16 flex items-center gap-3 flex-wrap">
            {!cameraStream ? (
              <button
                onClick={enableCamera}
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-semibold flex items-center gap-2 text-sm"
              >
                <Video className="w-4 h-4" />
                Enable Camera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="px-3 py-2 bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-2 text-sm"
              >
                <Square className="w-3 h-3" />
                Stop
              </button>
            )}

            {!hasStarted ? (
              <>
                <button
                  onClick={async () => {
                    if (!interviewId) return;
                    try {
                      const newQuestions = await apiService.regenerateQuestions(interviewId);
                      setQuestions(newQuestions);
                      toast.success('Questions regenerated!');
                    } catch (err) {
                      toast.error('Failed to regenerate questions');
                    }
                  }}
                  className="px-3 py-2 bg-purple-100 text-purple-700 rounded-xl font-semibold flex items-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  New Questions
                </button>
                <button
                  onClick={startInterview}
                  disabled={!cameraStream}
                  className={`px-5 py-2 rounded-xl font-bold flex items-center gap-2 ${
                    cameraStream 
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  Start Interview
                </button>
              </>
            ) : isIntroComplete ? (
              <>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 text-sm ${
                    isRecording 
                      ? 'bg-red-500 text-white' 
                      : 'bg-slate-100 text-slate-700'
                  }`}
                  disabled={showCodeEditor}
                >
                  {isRecording ? <><Square className="w-3 h-3" />Stop</> : <><Mic className="w-3 h-3" />Record</>}
                </button>

                {currentQ?.type === 'coding' && (
                  <button
                    onClick={() => setShowCodeEditor(!showCodeEditor)}
                    className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 text-sm ${
                      showCodeEditor 
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white' 
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Code className="w-3 h-3" />
                    {showCodeEditor ? 'Hide Code' : 'Write Code'}
                  </button>
                )}

                <button
                  onClick={() => nextQuestion(true)}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-semibold flex items-center gap-2 text-sm"
                >
                  {currentQuestion === 0 ? (
                    <><ChevronRight className="w-3 h-3" />Start Questions</>
                  ) : currentQuestion < totalQuestions - 1 ? (
                    <><ChevronRight className="w-3 h-3" />Next Question</>
                  ) : (
                    <><Award className="w-3 h-3" />Finish</>
                  )}
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* RIGHT SIDE - Questions, Transcript, Feedback */}
        <div className="w-[45%] p-3 flex flex-col gap-3 overflow-y-auto">
          
          {/* Question */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 p-4">
            {/* Progress Bar - Only show after intro */}
            {hasStarted && isIntroComplete && currentQ && !currentQ.isIntro && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Progress</span>
                  <span className="text-xs font-medium text-slate-700">
                    {currentQuestion - 1} / {totalQuestions - 2} questions answered
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((currentQuestion - 1) / (totalQuestions - 2)) * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Intro Notice */}
            {hasStarted && isIntroComplete && currentQ?.isIntro && (
              <div className="mb-3 px-3 py-2 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-lg">
                <p className="text-xs text-teal-700 font-medium">
                  🎤 <strong>Introduce yourself!</strong> Tell the interviewer about your background, skills, and experience.
                </p>
              </div>
            )}
            
            {/* Timer - Show for both intro and questions when recording */}
            {hasStarted && isIntroComplete && isRecording && currentQ && (
              <div className={`mb-3 px-3 py-2 rounded-lg flex items-center justify-between ${
                showTimeWarning 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-slate-50 border border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${showTimeWarning ? 'text-red-500' : 'text-slate-500'}`} />
                  <span className={`text-sm font-mono font-medium ${showTimeWarning ? 'text-red-600' : 'text-slate-700'}`}>
                    {formatTime(timeRemaining - questionTime)}
                  </span>
                </div>
                <span className={`text-xs ${showTimeWarning ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                  {currentQ.expectedDuration ? `${Math.round((questionTime / currentQ.expectedDuration) * 100)}% used` : 'No limit'}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-900 text-sm">
                  {currentQ?.isIntro ? 'Your Introduction' : `Question ${currentQuestion}`}
                </h3>
                {hasStarted && isIntroComplete && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    currentDifficulty <= 3 ? 'bg-green-100 text-green-700' :
                    currentDifficulty <= 6 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    Level {currentDifficulty}/10
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasStarted && isIntroComplete && currentQ && (
                  <button
                    onClick={toggleSpeak}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isSpeaking 
                        ? 'bg-teal-100 text-teal-600' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title={isSpeaking ? 'Stop speaking' : 'Listen to question'}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                )}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  currentQ?.isIntro ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {currentQ?.isIntro ? '🎤 Introduce Yourself' : `${currentQuestion}/${totalQuestions - 1}`}
                </span>
              </div>
            </div>
            {currentQ ? (
              <div>
                {/* Coding Question Banner */}
                {currentQ.type === 'coding' && (
                  <div className="mb-3 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg flex items-center gap-2 animate-pulse">
                    <Code className="w-5 h-5" />
                    <span className="font-bold text-sm">💻 CODING QUESTION - Write your code below!</span>
                  </div>
                )}
                
                <p className={`text-slate-800 font-medium text-sm mb-2 ${currentQ.type === 'coding' ? 'bg-purple-50 p-2 rounded-lg border border-purple-200' : ''}`}>{currentQ.text}</p>
                <div className="flex gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    currentQ.type === 'technical' ? 'bg-blue-50 text-blue-700' : 
                    currentQ.type === 'coding' ? 'bg-purple-100 text-purple-700 font-bold' :
                    currentQ.type === 'case_study' ? 'bg-orange-50 text-orange-700' :
                    'bg-emerald-50 text-emerald-700'
                  }`}>
                    {currentQ.type === 'coding' ? '💻 ' : ''}{currentQ.type}
                  </span>
                  {currentQ.category && (
                    <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs text-slate-600">
                      {currentQ.category}
                    </span>
                  )}
                  {currentQ.type === 'coding' && (
                    <span className="px-2 py-0.5 bg-purple-100 rounded-full text-xs text-purple-700">
                      ⏱️ {currentQ.expectedDuration ? Math.floor(currentQ.expectedDuration/60) : 5} min
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Start interview to see questions</p>
            )}
          </div>

          {/* Code Editor */}
          {showCodeEditor && currentQ?.type === 'coding' && (
            <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 border-b border-purple-300">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  💻 Write Your Code Here - {currentQ?.category || 'Coding Question'}
                </h3>
                <div className="flex items-center gap-2">
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-2 py-1 bg-white/90 border border-purple-300 rounded-lg text-xs font-medium"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
              </div>
              <div className="h-64">
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on'
                  }}
                />
              </div>
              <div className="flex gap-2 p-3 bg-slate-50 border-t border-slate-200">
                <button
                  onClick={submitCode}
                  disabled={isEvaluating || !code.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-semibold flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Code
                </button>
                <button
                  onClick={() => setCode('')}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm"
                >
                  Clear
                </button>
              </div>
              
              {codeEvaluation && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900 text-sm">Code Evaluation</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      codeEvaluation.overallScore >= 70 ? 'bg-green-100 text-green-700' :
                      codeEvaluation.overallScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {codeEvaluation.overallScore}/100
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {renderScoreCircle(codeEvaluation.correctness, 'Correctness', codeEvaluation.correctness >= 70 ? 'bg-green-500' : codeEvaluation.correctness >= 50 ? 'bg-yellow-500' : 'bg-red-500')}
                    {renderScoreCircle(codeEvaluation.efficiency, 'Efficiency', codeEvaluation.efficiency >= 70 ? 'bg-green-500' : codeEvaluation.efficiency >= 50 ? 'bg-yellow-500' : 'bg-red-500')}
                    {renderScoreCircle(codeEvaluation.codeQuality, 'Quality', codeEvaluation.codeQuality >= 70 ? 'bg-green-500' : codeEvaluation.codeQuality >= 50 ? 'bg-yellow-500' : 'bg-red-500')}
                    {renderScoreCircle(codeEvaluation.edgeCases, 'Edge Cases', codeEvaluation.edgeCases >= 70 ? 'bg-green-500' : codeEvaluation.edgeCases >= 50 ? 'bg-yellow-500' : 'bg-red-500')}
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{codeEvaluation.feedback}</p>
                  <div className="text-xs text-slate-500">
                    {codeEvaluation.suggestions.map((s, i) => (
                      <p key={i} className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-teal-500" />
                        {s}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Transcript */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 p-3 flex-1 min-h-[100px]">
            <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <MessageSquare className="w-3 h-3" />
              Your Answer (Transcript)
            </h3>
            <div className="bg-slate-50 rounded-lg p-2 h-[calc(100%-24px)] overflow-y-auto">
              <p className="text-xs text-slate-600">
                {transcript || (isRecording ? 'Listening... Speak your answer clearly!' : 'Click Record and speak your answer...')}
              </p>
            </div>
          </div>

          {/* AI Feedback */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 p-3">
            <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <Award className="w-3 h-3 text-teal-600" />
              AI Feedback
              {isProcessingFeedback && <Loader2 className="w-3 h-3 animate-spin text-teal-500" />}
            </h3>
            
            {isProcessingFeedback ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
                <span className="ml-2 text-sm text-slate-500">Analyzing your answer...</span>
              </div>
            ) : aiFeedback ? (
              <div>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {renderScoreCircle(aiFeedback.correctness, 'Correctness', aiFeedback.correctness >= 70 ? 'bg-green-500' : aiFeedback.correctness >= 50 ? 'bg-yellow-500' : 'bg-red-500')}
                  {renderScoreCircle(aiFeedback.confidence, 'Confidence', aiFeedback.confidence >= 70 ? 'bg-green-500' : aiFeedback.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500')}
                  {renderScoreCircle(aiFeedback.clarity, 'Clarity', aiFeedback.clarity >= 70 ? 'bg-green-500' : aiFeedback.clarity >= 50 ? 'bg-yellow-500' : 'bg-red-500')}
                  {renderScoreCircle(aiFeedback.eyeContact, 'Eye Contact', aiFeedback.eyeContact >= 70 ? 'bg-green-500' : aiFeedback.eyeContact >= 50 ? 'bg-yellow-500' : 'bg-red-500')}
                  {renderScoreCircle(aiFeedback.bodyLanguage, 'Body Lang', aiFeedback.bodyLanguage >= 70 ? 'bg-green-500' : aiFeedback.bodyLanguage >= 50 ? 'bg-yellow-500' : 'bg-red-500')}
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-900">Overall Score</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    aiFeedback.overallScore >= 70 ? 'bg-green-100 text-green-700' :
                    aiFeedback.overallScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {aiFeedback.overallScore}/100
                  </span>
                </div>
                
                <p className="text-xs text-slate-600 mb-2">{aiFeedback.feedback}</p>
                
                {/* Special breakdown for intro questions */}
                {currentQ?.isIntro || currentQ?.focus === 'introduction' || currentQ?.category === 'Introduction' ? (
                  <div className="mb-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs font-bold text-amber-800 mb-2">📝 Introduction Checklist:</p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <p className={transcript?.toLowerCase().includes('i am') || transcript?.toLowerCase().includes('my name') ? 'text-green-600' : 'text-red-400'}>
                        {transcript?.toLowerCase().includes('i am') || transcript?.toLowerCase().includes('my name') ? '✓' : '○'} Name & Title
                      </p>
                      <p className={transcript?.toLowerCase().includes('experience') || transcript?.toLowerCase().includes('worked') || transcript?.toLowerCase().includes('job') ? 'text-green-600' : 'text-red-400'}>
                        {transcript?.toLowerCase().includes('experience') || transcript?.toLowerCase().includes('worked') || transcript?.toLowerCase().includes('job') ? '✓' : '○'} Background
                      </p>
                      <p className={transcript?.toLowerCase().includes('skill') || transcript?.toLowerCase().includes('proficient') ? 'text-green-600' : 'text-red-400'}>
                        {transcript?.toLowerCase().includes('skill') || transcript?.toLowerCase().includes('proficient') ? '✓' : '○'} Skills
                      </p>
                      <p className={transcript?.toLowerCase().includes('project') || transcript?.toLowerCase().includes('built') ? 'text-green-600' : 'text-red-400'}>
                        {transcript?.toLowerCase().includes('project') || transcript?.toLowerCase().includes('built') ? '✓' : '○'} Projects
                      </p>
                      <p className={transcript?.toLowerCase().includes('university') || transcript?.toLowerCase().includes('college') || transcript?.toLowerCase().includes('degree') ? 'text-green-600' : 'text-red-400'}>
                        {transcript?.toLowerCase().includes('university') || transcript?.toLowerCase().includes('college') || transcript?.toLowerCase().includes('degree') ? '✓' : '○'} Education
                      </p>
                      <p className={transcript?.toLowerCase().includes('goal') || transcript?.toLowerCase().includes('interested') || transcript?.toLowerCase().includes('excited') ? 'text-green-600' : 'text-red-400'}>
                        {transcript?.toLowerCase().includes('goal') || transcript?.toLowerCase().includes('interested') || transcript?.toLowerCase().includes('excited') ? '✓' : '○'} Career Goals
                      </p>
                    </div>
                  </div>
                ) : null}
                
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700">💡 How to improve:</p>
                  {aiFeedback.suggestions.map((s, i) => (
                    <p key={i} className="text-xs flex items-center gap-1 text-slate-500">
                      <CheckCircle className="w-3 h-3 text-teal-500 flex-shrink-0" />
                      {s}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Answer a question to get AI feedback...</p>
            )}
          </div>

        </div>
      </div>

      {/* Replay Modal */}
      {showReplayModal && recordedVideoUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-100">
              <h3 className="font-bold text-slate-900">Interview Recording</h3>
              <button 
                onClick={() => setShowReplayModal(false)}
                className="p-1 hover:bg-slate-200 rounded-lg"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <div className="p-4">
              <video 
                src={recordedVideoUrl} 
                controls 
                autoPlay 
                className="w-full rounded-lg"
              />
              <div className="mt-4 flex gap-2">
                <a 
                  href={recordedVideoUrl} 
                  download={`interview_recording_${new Date().toISOString()}.webm`}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-xl font-semibold text-center"
                >
                  Download Recording
                </a>
                <button 
                  onClick={() => setShowReplayModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
