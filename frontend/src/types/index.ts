// ─── Core Entity Types ─────────────────────────────────────────────────────

export type ItemType   = 'lost' | 'found';
export type ItemStatus = 'active' | 'resolved' | 'expired' | 'pending';
export type UserRole   = 'user' | 'admin' | 'moderator';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export type ItemCategory =
  | 'Electronics'
  | 'Bags & Wallets'
  | 'Keys'
  | 'Clothing'
  | 'Jewelry'
  | 'Documents'
  | 'Pets'
  | 'Books'
  | 'Sports'
  | 'Toys'
  | 'Musical Instruments'
  | 'Vehicles'
  | 'Other';

// ─── User ──────────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  googleId?: string;
  department?: string;
  createdAt?: string;
  trustScore?: number;
  badges?: string[];
  achievements?: Achievement[];
  stats: {
    itemsReported: number;
    itemsFound: number;
    successfulReturns: number;
    responseRate?: number;
  };
  bio?: string;
  location?: string;
  joinedAt: string;
  lastSeen?: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  department?: string;
  trustScore?: number;
  badges?: string[];
}

// ─── Item ──────────────────────────────────────────────────────────────────

export interface ItemLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  building?: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface VerificationQuestion {
  question: string;
  answer?: string; // only visible to owner
}

export interface Item {
  _id: string;
  type: ItemType;
  title: string;
  description: string;
  category: ItemCategory;
  images: string[];
  status: ItemStatus;
  location: ItemLocation;
  date: string;
  reward?: number;
  tags: string[];
  aiDescription?: string;
  reportedBy: User | string;
  claims: Claim[];
  views: number;
  bookmarks: string[];
  verificationQuestions: VerificationQuestion[];
  isBookmarked?: boolean;
  matchScore?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Claim ─────────────────────────────────────────────────────────────────

export interface ClaimAnswer {
  question: string;
  answer: string;
}

export interface Claim {
  _id: string;
  item: Item | string;
  claimant: User | string;
  status: ClaimStatus;
  answers: ClaimAnswer[];
  message?: string;
  verificationScore?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Message & Chat ────────────────────────────────────────────────────────

export interface Message {
  _id: string;
  conversationId: string;
  sender: User | string;
  content: string;
  type: 'text' | 'image' | 'system';
  imageUrl?: string;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  item: Item;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
}

// ─── Notification ──────────────────────────────────────────────────────────

export type NotificationType =
  | 'claim_submitted'
  | 'claim_approved'
  | 'claim_rejected'
  | 'new_message'
  | 'item_match'
  | 'achievement_earned'
  | 'system';

export interface Notification {
  _id: string;
  user: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  link?: string;
  avatar?: string;
  createdAt: string;
}

// ─── API Response Types ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalItems: number;
  activeItems: number;
  resolvedItems: number;
  pendingClaims: number;
  successRate: number;
  totalViews: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'item_reported' | 'claim_submitted' | 'claim_approved' | 'item_resolved';
  title: string;
  description: string;
  item?: Pick<Item, '_id' | 'title' | 'type'>;
  createdAt: string;
}

// ─── Admin ──────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  totalItems: number;
  resolvedItems: number;
  activeItems: number;
  pendingReports: number;
  successRate: number;
  monthlyStats: { month: string; items: number; resolved: number }[];
  categoryBreakdown: { category: string; count: number }[];
}

// ─── Form Types ────────────────────────────────────────────────────────────

export interface ReportItemForm {
  type: ItemType;
  title: string;
  category: ItemCategory;
  description: string;
  date: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: [number, number];
  };
  images: File[];
  reward?: number;
  tags: string[];
  verificationQuestions: { question: string; answer: string }[];
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ─── Filter & Search ───────────────────────────────────────────────────────

export interface ItemFilters {
  type?: ItemType;
  category?: ItemCategory;
  status?: ItemStatus;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
  hasReward?: boolean;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'most-viewed' | 'nearest';
  page?: number;
  limit?: number;
}

// ─── AI Types ─────────────────────────────────────────────────────────────

export interface AIMatch {
  item: Item;
  score: number;
  matchReasons: string[];
}

export interface AISearchResult {
  parsedQuery: {
    category?: string;
    color?: string;
    brand?: string;
    location?: string;
    date?: string;
    description?: string;
  };
  items: Item[];
}
