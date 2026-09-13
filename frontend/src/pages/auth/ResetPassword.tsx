import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, ArrowLeft, Sparkles, CheckCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input } from '../../components/ui';
import { authApi } from '../../api/client';
import { useAuthStore } from '../../store';

const schema = z
  .object({
    password:        z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path:    ['confirmPassword'],
  });

type Form = z.infer<typeof schema>;

const ResetPassword: React.FC = () => {
  const [searchParams]   = useSearchParams();
  const navigate          = useNavigate();
  const { setAuth }       = useAuthStore();
  const [success, setSuccess] = React.useState(false);
  const [showPass, setShowPass]     = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const token = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  // If no token in URL, show error
  if (!token) {
    return (
      <div className="min-h-screen bg-[--color-bg] flex items-center justify-center p-6">
        <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 p-8 shadow-card text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2">Invalid Reset Link</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            This reset link is missing or invalid. Please request a new one.
          </p>
          <Link to="/forgot-password" className="btn-primary w-full justify-center">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: Form) => {
    try {
      const res = await authApi.resetPassword(token, data.password);
      const { user, token: authToken } = res.data.data;
      setAuth(user, authToken);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Reset link is invalid or has expired.';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[--color-bg] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>

        <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 p-8 shadow-card">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-gray-900 dark:text-white">FindIt</span>
          </div>

          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2">
                Password Reset! 🎉
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Your password has been updated. Redirecting you to the dashboard…
              </p>
            </motion.div>
          ) : (
            <>
              <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">
                Set New Password
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Choose a strong password for your FindIt account.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="New Password"
                  type={showPass ? 'text' : 'password'}
                  id="reset-password"
                  placeholder="At least 8 characters"
                  icon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  iconRight={showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  onIconRightClick={() => setShowPass((v) => !v)}
                  {...register('password')}
                />

                <Input
                  label="Confirm Password"
                  type={showConfirm ? 'text' : 'password'}
                  id="reset-confirm-password"
                  placeholder="Repeat your new password"
                  icon={<Lock className="w-4 h-4" />}
                  error={errors.confirmPassword?.message}
                  iconRight={showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  onIconRightClick={() => setShowConfirm((v) => !v)}
                  {...register('confirmPassword')}
                />

                <Button type="submit" id="reset-submit-btn" fullWidth loading={isSubmitting} size="lg">
                  Reset Password
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
