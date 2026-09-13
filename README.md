# 🔍 FindIt — Campus Lost & Found Portal

A modern, full-stack Lost and Found portal built for university and college campuses. It allows students, faculty, and staff to instantly report lost items, view live board listings, submit private finder tips to campus administrators, and self-resolve recovered items.

---

## 🌟 Key Features

### 1. Instant Public Board Publishing
- **Immediate Visibility**: When a student reports a lost item, it is posted directly to the **Public Board** (`status: 'active'`) with title, category, description, location, and photos.
- **Fast Community Discovery**: Eliminates administrative bottleneck delays so fellow campus members can immediately see missing items and help.

### 2. Private Finder Tip System ("I Found This")
- **Safe & Private**: Other students who spot a lost item click **"I Found This"** to send a tip (location details, optional contact) **privately to the campus admin**.
- **Fraud & Spam Prevention**: Tips are kept private to protect student privacy and avoid scams.
- **Self-Tip Protection**: The item's owner is prevented from accidentally submitting a tip on their own item and clearly sees a "Your item" indicator instead.

### 3. Self-Resolution ("I Found It!")
- **Owner-Driven Resolution**: If the owner recovers or finds their lost item themselves, they can click **"I Found It! (Mark as Resolved)"** directly from:
  - The **Item Details page** (`/items/:id`)
  - The **User Dashboard** (`/dashboard` under *My Reports*)
- **Automated Lifecycle**: Marking an item as resolved:
  - Changes status to `resolved` (marked with a green *Recovered* badge).
  - Automatically unpublishes it from the active missing board.
  - Increments the user's successful recovery statistics.

### 4. Admin Verification & Management
- Admins have access to the **Admin Dashboard** (`/admin`):
  - View all incoming finder tips and contact details.
  - Coordinate returns between finders and owners.
  - Resolve items once handovers are confirmed.
  - System-wide statistics and activity tracking.

### 5. Authentication & Security
- Secure registration and login with JWT and HTTP-only cookies.
- Password reset flow via email using Nodemailer.
- Role-based authorization: `user` vs `admin`.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, TanStack Query (React Query), Framer Motion, Lucide React, React Hot Toast.
- **Backend**: Node.js, Express, TypeScript, MongoDB with Mongoose, Socket.IO, Multer (image uploads), Nodemailer.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally on `mongodb://localhost:27017/lost-and-found` or MongoDB Atlas URI.

### 1. Installation

```bash
# Clone or open the repository root
cd Lost_and_Found_Portal

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/lost-and-found
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Email configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

#### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Running the Application

In terminal 1 (Backend):
```bash
cd backend
npm run dev
```

In terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 👥 Default Test Accounts

| Role | Email | Password |
|---|---|---|
| 🛡️ **Admin** | `admin@campus.edu` | `Admin@1234` |
| 🎓 **Student** | `student@campus.edu` | `Pass@1234` |

---

## 📌 Recent Updates & Architectural Changes

1. **Direct Publishing**: Changed lost item reporting from requiring prior admin approval to publishing immediately to the board.
2. **Finder Tip Flow**: Added role and ID checks so owners cannot submit finder tips on their own reports.
3. **Self-Resolve Feature**: Implemented `PATCH /api/items/:id/resolve` enabling owners to mark items recovered from their dashboard or item page.
4. **Clean UI**: Removed extraneous AI assistant widget for a clean, focused user experience.
