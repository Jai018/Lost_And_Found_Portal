import mongoose, { Document, Schema } from 'mongoose';

export interface IFinderTip {
  submittedBy: mongoose.Types.ObjectId;
  message:     string;
  contact?:    string;
  status:      'new' | 'reviewed' | 'verified';
  createdAt:   Date;
}

export interface IItem extends Document {
  type:        'lost' | 'found';
  title:       string;
  description: string;
  category:    string;
  images:      string[];
  // Admin-mediated status: items start as 'pending' until admin approves
  status:      'pending' | 'active' | 'resolved' | 'rejected';
  orgCode:     string;             // which org this item belongs to
  location: {
    address:   string;
    building?: string;             // campus-specific: e.g. "Block A, 2nd Floor"
    coordinates: number[];
  };
  date:          Date;
  tags:          string[];
  aiDescription?: string;
  // Admin-mediation fields
  reportedBy:    mongoose.Types.ObjectId;   // original user who submitted report
  approvedBy?:   mongoose.Types.ObjectId;   // admin who published this to board
  approvedAt?:   Date;
  linkedReport?: mongoose.Types.ObjectId;   // the OrgReport this was published from
  // Finder tips (instead of public claims)
  finderTips:    IFinderTip[];
  views:         number;
  isReported:    boolean;
  reportReasons: string[];
  createdAt:     Date;
  updatedAt:     Date;
}

const FinderTipSchema = new Schema<IFinderTip>(
  {
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message:     { type: String, required: true, maxlength: 1000 },
    contact:     { type: String },
    status:      { type: String, enum: ['new', 'reviewed', 'verified'], default: 'new' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ItemSchema = new Schema<IItem>(
  {
    type:        { type: String, enum: ['lost', 'found'], required: true },
    title:       { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    category:    { type: String, required: true },
    images:      [{ type: String }],
    status:      { type: String, enum: ['pending', 'active', 'resolved', 'rejected'], default: 'pending' },
    orgCode:     { type: String, required: true, default: 'default' },
    location: {
      address:     { type: String, default: '' },
      building:    { type: String, default: '' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    date:    { type: Date, required: true },
    tags:    [{ type: String, lowercase: true, trim: true }],
    aiDescription: { type: String },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    linkedReport: { type: Schema.Types.ObjectId, ref: 'OrgReport' },
    finderTips:   [FinderTipSchema],
    views:        { type: Number, default: 0 },
    isReported:   { type: Boolean, default: false },
    reportReasons: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
ItemSchema.index({ status: 1, orgCode: 1 });
ItemSchema.index({ type: 1 });
ItemSchema.index({ category: 1 });
ItemSchema.index({ date: -1 });
ItemSchema.index({ reportedBy: 1 });
ItemSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Item = mongoose.model<IItem>('Item', ItemSchema);
