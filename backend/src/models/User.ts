import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name:        string;
  email:       string;
  password?:   string;
  avatar?:     string;
  role:        'user' | 'admin' | 'moderator';
  isVerified:  boolean;
  googleId?:   string;
  // Organisation fields
  orgCode?:    string;       // which org this user belongs to
  department?: string;       // e.g. "Computer Science"
  studentId?:  string;       // e.g. student/employee ID
  stats: {
    itemsReported:    number;
    itemsFound:       number;
    successfulReturns: number;
  };
  bio?:      string;
  isActive:  boolean;
  bookmarks: string[];   // item IDs the user has bookmarked
  emailVerificationToken?: string;
  passwordResetToken?:     string;
  passwordResetExpires?:   Date;
  notificationPrefs: {
    email:   boolean;
    push:    boolean;
    matches: boolean;
  };
  lastSeen?:  Date;
  createdAt:  Date;
  updatedAt:  Date;
  comparePassword(candidate: string): Promise<boolean>;
  joinedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name:       { type: String, required: true, trim: true, maxlength: 100 },
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:   { type: String, select: false },
    avatar:     { type: String },
    role:       { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    googleId:   { type: String, sparse: true },
    // Organisation
    orgCode:    { type: String, default: 'default' },
    department: { type: String },
    studentId:  { type: String },
    stats: {
      itemsReported:     { type: Number, default: 0 },
      itemsFound:        { type: Number, default: 0 },
      successfulReturns: { type: Number, default: 0 },
    },
    bio:      { type: String, maxlength: 500 },
    isActive: { type: Boolean, default: true },
    bookmarks: [{ type: String }],   // item IDs
    emailVerificationToken: { type: String, select: false },
    passwordResetToken:     { type: String, select: false },
    passwordResetExpires:   { type: Date,   select: false },
    notificationPrefs: {
      email:   { type: Boolean, default: true },
      push:    { type: Boolean, default: true },
      matches: { type: Boolean, default: true },
    },
    lastSeen: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
      },
    },
  }
);

// Virtual: joinedAt alias for createdAt
UserSchema.virtual('joinedAt').get(function () { return this.createdAt; });

// ── Pre-save: hash password ────────────────────────────────────────────────
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ── Method: compare password ──────────────────────────────────────────────
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

// ── Indexes ────────────────────────────────────────────────────────────────
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ orgCode: 1 });
UserSchema.index({ role: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
