import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input } from '../../components/ui';
import { authApi } from '../../api/client';
import { useAuthStore } from '../../store';

// ─── Schema ───────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

// ─── Auth Page Illustration ───────────────────────────────────────────────
const AuthIllustration: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="relative flex flex-col items-center justify-center h-full p-12 text-white overflow-hidden">
    {/* Background */}
    <div className="absolute inset-0 bg-hero-gradient" />
    <div className="absolute inset-0 bg-dot-pattern opacity-20" />
    <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />

    <div className="relative z-10 max-w-sm text-center space-y-8">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="flex items-center justify-center gap-2.5 mb-6"
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-black text-2xl">Find<span className="text-accent-300">It</span></span>
      </motion.div>

      {/* Floating item cards illustration */}
      <div className="relative h-48 my-6">
        {[
          { emoji: '📱', x: 20, y: 0,  delay: 0,   rotate: -8 },
          { emoji: '👜', x: 120, y: 30, delay: 0.3, rotate: 5 },
          { emoji: '🔑', x: 60,  y: 80, delay: 0.6, rotate: -3 },
          { emoji: '📄', x: 160, y: 10, delay: 0.9, rotate: 10 },
          { emoji: '💍', x: 10,  y: 110, delay: 1.2, rotate: -12 },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: item.rotate, y: [0, -8, 0] }}
            transition={{
              opacity: { delay: item.delay, duration: 0.4 },
              scale:   { delay: item.delay, duration: 0.4, type: 'spring' },
              y:       { delay: item.delay + 0.5, duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{ position: 'absolute', left: item.x, top: item.y }}
            className="w-16 h-16 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
          >
            {item.emoji}
          </motion.div>
        ))}
        {/* Center glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-primary-400/30 rounded-full blur-2xl" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-display font-bold mb-2">{title}</h2>
        <p className="text-white/60 text-sm leading-relaxed">{subtitle}</p>
      </div>

      {/* Trust badges */}
      <div className="space-y-2.5">
        {[
          'Join 50,000+ users who trust FindIt',
          'AI-powered matching technology',
          '95% item recovery success rate',
        ].map((text) => (
          <div key={text} className="flex items-center gap-2.5 text-sm text-white/75">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            {text}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────
const Login: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const from = (location.state as { from?: string })?.from || '/dashboard';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await authApi.login(data);
      setAuth(res.data.data.user, res.data.data.token);
      toast.success(`Welcome back, ${res.data.data.user.name.split(' ')[0]}! 👋`);
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid email or password');
    }
  };


  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Illustration */}
      <div className="hidden lg:block">
        <AuthIllustration
          title="Welcome back to FindIt"
          subtitle="Sign in to manage your items, track claims, and connect with your community."
        />
      </div>

      {/* Right: Form */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-[--color-bg]">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">
              Find<span className="text-primary-500">It</span>
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white">
              Sign in to your account
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                Create one free
              </Link>
            </p>
          </div>


          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              id="login-email"
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              autoComplete="email"
              {...register('email')}
            />
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              id="login-password"
              placeholder="Enter your password"
              icon={<Lock className="w-4 h-4" />}
              iconRight={showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              onIconRightClick={() => setShowPass(!showPass)}
              error={errors.password?.message}
              autoComplete="current-password"
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              id="login-submit-btn"
              fullWidth
              loading={isSubmitting}
              iconRight={!isSubmitting ? <ArrowRight className="w-4 h-4" /> : undefined}
              size="lg"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 dark:text-gray-600">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-gray-600">Terms</Link> and{' '}
            <Link to="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
