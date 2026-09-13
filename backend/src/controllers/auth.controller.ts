import crypto from 'crypto';
import { Request, Response } from 'express';
import { User } from '../models/User';
import { asyncHandler } from '../middleware/error';
import { generateToken, AuthRequest } from '../middleware/auth';
import { sendPasswordResetEmail } from '../utils/email';

const cookieOpts = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge:   30 * 24 * 60 * 60 * 1000, // 30 days
};

// ── Register ────────────────────────────────────────────────────────────
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email is already registered.' });
  }

  const user = await User.create({ name, email, password });

  // Grant first_report badge eventually via hook — start with clean stats
  const token = generateToken(user._id.toString());
  res.cookie('token', token, cookieOpts);

  res.status(201).json({
    success: true,
    data: { user: user.toJSON(), token },
  });
});

// ── Login ───────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }
  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  user.lastSeen = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id.toString());
  res.cookie('token', token, cookieOpts);

  res.json({
    success: true,
    data: { user: user.toJSON(), token },
  });
});

// ── Logout ──────────────────────────────────────────────────────────────
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.cookie('token', '', { ...cookieOpts, maxAge: 0 });
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ── Get current user ─────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  // req.user is already populated by the protect middleware — no extra DB call needed
  res.json({ success: true, data: req.user });
});

// ── Forgot password ──────────────────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() }).select(
    '+passwordResetToken +passwordResetExpires'
  );

  // Always return same message to prevent email enumeration
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  }

  // Generate a secure random token
  const rawToken   = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.passwordResetToken   = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl    = `${frontendUrl}/reset-password?token=${rawToken}`;

  // Always log to console for dev testing
  console.log('\n🔑 Password Reset Link (DEV):');
  console.log(resetUrl);
  console.log('');

  try {
    await sendPasswordResetEmail(user.email, user.name, rawToken);
    console.log(`✅ Reset email sent to ${user.email}`);
    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    // Don't rollback token — link is logged to console for dev use
    console.error('⚠️  Email send error (reset link logged above):', (err as Error).message);
    // Still return success so user flow works even without email
    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  }
});

// ── Reset password ────────────────────────────────────────────────────────
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Token and new password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
  }

  // Hash the incoming raw token and look up
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken:   hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires +password');

  if (!user) {
    return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });
  }

  // Update password and clear reset fields
  user.password             = password;
  user.passwordResetToken   = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Auto-login: issue a new JWT
  const authToken = generateToken(user._id.toString());
  res.cookie('token', authToken, cookieOpts);

  res.json({
    success: true,
    message: 'Password reset successfully.',
    data:    { user: user.toJSON(), token: authToken },
  });
});

// ── Google OAuth callback ─────────────────────────────────────────────────
export const googleCallback = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user  = req.user!;
  const token = generateToken(user._id.toString());
  res.cookie('token', token, cookieOpts);
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`);
});
