import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { apiService } from '../services/api';
import { toast } from 'sonner';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const oauth = params.get('oauth');

    if (accessToken && refreshToken) {
      apiService.setToken(accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      toast.success(`Welcome! Logged in via ${oauth}!`);
      window.history.replaceState({}, document.title, '/');
      onLogin();
    }
  }, [onLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        const { user, token } = await apiService.register(email, password, name);
        apiService.setToken(token);
        toast.success(`Welcome, ${user.name}!`);
      } else {
        const { user, token } = await apiService.login(email, password);
        apiService.setToken(token);
        toast.success(`Welcome back, ${user.name}!`);
      }
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const audioBars = [
    { id: 1, height: 80, color: 'from-sky-400 to-blue-500' },
    { id: 2, height: 56, color: 'from-emerald-400 to-green-500' },
    { id: 3, height: 120, color: 'from-sky-300 to-sky-400' },
    { id: 4, height: 88, color: 'from-green-500 to-emerald-600' },
  ];

  return (
    <div className="min-h-screen flex">
      <motion.div
        className="w-full lg:w-1/2 flex items-center justify-center p-12 bg-gradient-to-br from-white via-blue-50/20 to-white"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-md">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center gap-0 mb-3">
              <h1
                className="text-4xl font-bold text-slate-800 tracking-tight"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Inter
              </h1>
              <h1
                className="text-4xl font-bold tracking-tight"
                style={{ fontFamily: "'Inter', sans-serif", color: '#10b981' }}
              >
                You
              </h1>
            </div>
            <p className="text-slate-600 text-base" style={{ fontFamily: "'Inter', sans-serif" }}>
              Welcome back! Please login to continue.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-2"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-base bg-white hover:border-slate-300"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  required
                />
              </div>
            </div>

            {isRegisterMode && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-base bg-white hover:border-slate-300"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    required={isRegisterMode}
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-2"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-base bg-white hover:border-slate-300"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                />
                <span className="text-slate-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Remember me
                </span>
              </label>
              <button type="button" className="text-sky-600 hover:text-sky-700 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
                Forgot password?
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-sky-600 to-blue-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-sky-700 hover:to-blue-700 transition-all shadow-lg shadow-sky-600/30 disabled:opacity-50"
              style={{ fontFamily: "'Inter', sans-serif" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">Loading...</span>
              ) : (
                <>
                  {isRegisterMode ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            <p className="text-center text-sm text-slate-600" style={{ fontFamily: "'Inter', sans-serif" }}>
              {isRegisterMode ? 'Already have an account? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setError('');
                }}
                className="text-sky-600 hover:text-sky-700 font-bold"
              >
                {isRegisterMode ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </motion.form>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
                className="flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-slate-200 rounded-xl bg-white hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-sm font-semibold text-slate-700">Google</span>
              </button>

              <button
                type="button"
                onClick={() => window.location.href = 'http://localhost:5000/api/auth/github'}
                className="flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-slate-200 rounded-xl bg-white hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-sm font-semibold text-slate-700">GitHub</span>
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-50 via-blue-50 to-emerald-50 items-center justify-center p-12 relative overflow-hidden"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute top-20 right-20 w-72 h-72 bg-sky-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center">
          <motion.div
            className="flex items-center justify-center gap-4 mb-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {audioBars.map((bar) => (
              <motion.div
                key={bar.id}
                className={`w-10 bg-gradient-to-b ${bar.color} rounded-full shadow-xl`}
                initial={{ height: bar.height }}
                animate={{
                  scaleY: [1, 1.2, 0.9, 1.15, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: bar.id * 0.15,
                }}
                style={{ height: `${bar.height}px` }}
              />
            ))}
          </motion.div>

          <motion.div
            className="flex items-center justify-center gap-0 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <h1
              className="text-7xl font-bold text-slate-800 tracking-tight"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Inter
            </h1>
            <h1
              className="text-7xl font-bold tracking-tight"
              style={{ fontFamily: "'Inter', sans-serif", color: '#10b981' }}
            >
              You
            </h1>
          </motion.div>

          <motion.h2
            className="text-3xl font-bold text-slate-800 mb-4 flex items-center justify-center gap-2"
            style={{ fontFamily: "'Inter', sans-serif" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Sparkles className="w-7 h-7 text-yellow-500" />
            Your Interview Success Partner
          </motion.h2>

          <motion.p
            className="text-slate-600 text-lg text-center max-w-lg mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            Build confidence, acquire skills, and land your dream job through our comprehensive AI-powered interview preparation platform.
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-3 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            {[
              { label: 'Build Confidence', color: 'from-sky-500 to-blue-600' },
              { label: 'Acquire Skills', color: 'from-emerald-500 to-green-600' },
              { label: 'Get Connected', color: 'from-yellow-400 to-amber-500' },
              { label: 'Land Jobs', color: 'from-blue-600 to-sky-600' }
            ].map((feature, i) => (
              <motion.div
                key={feature.label}
                className={`px-7 py-3 bg-gradient-to-r ${feature.color} rounded-full text-sm font-bold text-white shadow-lg`}
                style={{ fontFamily: "'Inter', sans-serif" }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + i * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.08, y: -2 }}
              >
                {feature.label}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
