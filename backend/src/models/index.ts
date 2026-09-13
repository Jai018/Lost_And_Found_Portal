import mongoose, { Document, Schema } from 'mongoose';

// ─── OrgReport ────────────────────────────────────────────────────────────
// A private report submitted by a member to the admin.
// Admin reviews and either publishes it as a public Item or rejects it.
export interface IOrgReport extends Document {
  reportedBy:   mongoose.Types.ObjectId;
  orgCode:      string;
  title:        string;
  description:  string;
  category:     string;
  images:       string[];
  locationDetails: string;   // where last seen on campus
  dateOccurred: Date;
  contactInfo?: string;       // optional extra contact from reporter
  status:       'pending' | 'published' | 'rejected';
  adminNote?:   string;       // admin's reply/reason
  publishedItem?: mongoose.Types.ObjectId;  // link to created Item if published
  createdAt:    Date;
  updatedAt:    Date;
}

const OrgReportSchema = new Schema<IOrgReport>(
  {
    reportedBy:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orgCode:         { type: String, required: true, default: 'default' },
    title:           { type: String, required: true, trim: true, maxlength: 200 },
    description:     { type: String, required: true, maxlength: 2000 },
    category:        { type: String, required: true },
    images:          [{ type: String }],
    locationDetails: { type: String, required: true, maxlength: 500 },
    dateOccurred:    { type: Date, required: true },
    contactInfo:     { type: String },
    status:          { type: String, enum: ['pending', 'published', 'rejected'], default: 'pending' },
    adminNote:       { type: String },
    publishedItem:   { type: Schema.Types.ObjectId, ref: 'Item' },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

OrgReportSchema.index({ status: 1, orgCode: 1 });
OrgReportSchema.index({ reportedBy: 1 });
OrgReportSchema.index({ createdAt: -1 });

export const OrgReport = mongoose.model<IOrgReport>('OrgReport', OrgReportSchema);

// ─── Message ──────────────────────────────────────────────────────────────
export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  sender:         mongoose.Types.ObjectId;
  content:        string;
  type:           'text' | 'image' | 'system';
  imageUrl?:      string;
  readAt?:        Date;
  createdAt:      Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender:         { type: Schema.Types.ObjectId, ref: 'User',         required: true },
    content:        { type: String, required: true, maxlength: 5000 },
    type:           { type: String, enum: ['text', 'image', 'system'], default: 'text' },
    imageUrl:       { type: String },
    readAt:         { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);

// ─── Conversation ─────────────────────────────────────────────────────────
export interface IConversation extends Document {
  item?:         mongoose.Types.ObjectId;
  participants:  mongoose.Types.ObjectId[];
  lastMessage?:  mongoose.Types.ObjectId;
  unreadCounts:  Map<string, number>;
  isActive:      boolean;
  createdAt:     Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    item:         { type: Schema.Types.ObjectId, ref: 'Item' },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastMessage:  { type: Schema.Types.ObjectId, ref: 'Message' },
    unreadCounts: { type: Map, of: Number, default: {} },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ item: 1, participants: 1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);

// ─── Notification ──────────────────────────────────────────────────────────
export interface INotification extends Document {
  user:    mongoose.Types.ObjectId;
  type:    string;
  title:   string;
  body:    string;
  read:    boolean;
  link?:   string;
  avatar?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type:   { type: String, required: true },
    title:  { type: String, required: true },
    body:   { type: String, required: true },
    read:   { type: Boolean, default: false },
    link:   { type: String },
    avatar: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

NotificationSchema.index({ user: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
