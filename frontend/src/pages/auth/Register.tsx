import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight,
  Sparkles, Shield, Zap, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input } from '../../components/ui';
import { authApi } from '../../api/client';
import { useAuthStore } from '../../store';
import { clsx } from 'clsx';

const registerSchema = z.object({
  name:            z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  email:           z.string().email('Please enter a valid email address'),
  password:        z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type RegisterForm = z.infer<typeof registerSchema>;

const FEATURES = [
  { icon: <Zap className="w-4 h-4" />,    text: 'Admin-verified lost & found'    },
  { icon: <Shield className="w-4 h-4" />, text: 'Private & secure reporting'     },
  { icon: <Users className="w-4 h-4" />,  text: 'Organisation-scoped platform'  },
];

const TRUST_STATS = [
  { stat: 'Private',  label: 'Reports go only to admin'       },
  { stat: 'Fast',     label: 'Admin reviews within hours'     },
  { stat: 'Secure',   label: 'Identity verified before return' },
];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');
  const strengthScore = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strengthScore];
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'][strengthScore];

  const onSubmit = async (data: RegisterForm) => {
    try {
      const res = await authApi.register({
        name: data.name, email: data.email, password: data.password,
      });
      setAuth(res.data.data.user, res.data.data.token);
      toast.success('Welcome! Your account has been created.');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ── Left panel ──────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-dot-pattern opacity-20" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-black text-2xl text-white">
              Find<span className="text-accent-300">It</span>
            </span>
          </Link>
        </div>

        {/* Middle content */}
        <div className="relative z-10 space-y-8">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-7xl text-center"
          >
            🔍
          </motion.div>

          <div className="text-center">
            <h2 className="text-2xl font-display font-bold text-white mb-2">
              Join Your Organisation
            </h2>
            <p className="text-white/60 text-sm">
              A safe, private lost & found system for your campus or workplace.
            </p>
          </div>

          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div
                key={f.text}
                className="flex items-center gap-3 text-sm text-white/80 bg-white/10 rounded-xl px-4 py-3 border border-white/10"
              >
                <span className="text-accent-300 flex-shrink-0">{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        {/* Trust stats */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 space-y-3">
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider">How it works</p>
          {TRUST_STATS.map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="text-white/70 text-sm">{s.label}</span>
              <span className="font-bold text-white text-sm">{s.stat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: Form ────────────────────────────────────────── */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-[--color-bg] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">
              Find<span className="text-primary-500">It</span>
            </span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white">
              Create your account
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>


          {/* Registration form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              id="register-name"
              placeholder="Your full name"
              icon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              autoComplete="name"
              {...register('name')}
            />

            <Input
              label="Email address"
              type="email"
              id="register-email"
              placeholder="you@organisation.com"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              autoComplete="email"
              {...register('email')}
            />

            <div>
              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                id="register-password"
                placeholder="Create a strong password"
                icon={<Lock className="w-4 h-4" />}
                iconRight={showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                onIconRightClick={() => setShowPass(!showPass)}
                error={errors.password?.message}
                autoComplete="new-password"
                {...register('password')}
              />
              {/* Strength bar */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={clsx(
                          'flex-1 h-1.5 rounded-full transition-all duration-300',
                          strengthScore >= level ? strengthColor : 'bg-gray-200 dark:bg-navy-700'
                        )}
                      />
                    ))}
                  </div>
                  <p className={clsx(
                    'text-xs font-medium',
                    strengthScore <= 1 ? 'text-red-500' :
                    strengthScore === 2 ? 'text-yellow-600' :
                    strengthScore === 3 ? 'text-blue-500' : 'text-emerald-600'
                  )}>
                    {strengthLabel} password
                  </p>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type={showConfirm ? 'text' : 'password'}
              id="register-confirm-password"
              placeholder="Repeat your password"
              icon={<Lock className="w-4 h-4" />}
              iconRight={showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              onIconRightClick={() => setShowConfirm(!showConfirm)}
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
              {...register('confirmPassword')}
            />

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <Button
              type="submit"
              id="register-submit-btn"
              fullWidth
              loading={isSubmitting}
              iconRight={!isSubmitting ? <ArrowRight className="w-4 h-4" /> : undefined}
              size="lg"
            >
              Create Account
            </Button>
          </form>
        </motion.div>
      </div>

    </div>
  );
};

export default Register;
