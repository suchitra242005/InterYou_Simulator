import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { AnimatedIntro } from "./components/AnimatedIntro";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { ResumeUpload } from "./components/ResumeUpload";
import { ResumeSummary } from "./components/ResumeSummary";
import { Interview } from "./components/Interview";
import { Resume } from "./services/api";

type AppStage =
  | "intro"
  | "login"
  | "dashboard"
  | "resume-upload"
  | "resume-summary"
  | "interview";

export default function App() {
  const [stage, setStage] = useState<AppStage>("intro");
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [currentInterviewId, setCurrentInterviewId] = useState<string | null>(null);

  const handleLogout = () => {
    setStage("login");
  };

  return (
    <div className="size-full">
      <AnimatePresence mode="wait">
        {stage === "intro" && (
          <AnimatedIntro
            key="intro"
            onComplete={() => setStage("login")}
          />
        )}
        {stage === "login" && (
          <Login
            key="login"
            onLogin={() => setStage("dashboard")}
          />
        )}
        {stage === "dashboard" && (
          <Dashboard
            key="dashboard"
            onStartInterview={() => setStage("resume-upload")}
          />
        )}
        {stage === "resume-upload" && (
          <ResumeUpload
            key="resume-upload"
            onContinue={(resume) => {
              setCurrentResume(resume);
              setStage("resume-summary");
            }}
            onBack={() => setStage("dashboard")}
            onLogout={handleLogout}
          />
        )}
        {stage === "resume-summary" && (
          <ResumeSummary
            key="resume-summary"
            resume={currentResume}
            onContinue={(interviewId) => {
              setCurrentInterviewId(interviewId);
              setStage("interview");
            }}
            onBack={() => setStage("resume-upload")}
            onLogout={handleLogout}
          />
        )}
        {stage === "interview" && (
          <Interview
            key="interview"
            resume={currentResume}
            interviewId={currentInterviewId}
            onBack={() => setStage("dashboard")}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}