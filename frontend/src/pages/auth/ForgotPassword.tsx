import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input } from '../../components/ui';
import { authApi } from '../../api/client';

const schema = z.object({ email: z.string().email('Please enter a valid email') });
type Form = z.infer<typeof schema>;

const ForgotPassword: React.FC = () => {
  const [sent, setSent] = React.useState(false);
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
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
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-gray-900 dark:text-white">FindIt</span>
          </div>

          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                We sent a password reset link to <strong>{getValues('email')}</strong>. Check your inbox (and spam folder).
              </p>
              <Link to="/login" className="btn-primary mt-6 w-full justify-center">Back to Sign In</Link>
            </motion.div>
          ) : (
            <>
              <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Forgot your password?</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Enter your email and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  id="forgot-email"
                  placeholder="you@example.com"
                  icon={<Mail className="w-4 h-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button type="submit" id="forgot-submit-btn" fullWidth loading={isSubmitting} size="lg">
                  Send Reset Link
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
