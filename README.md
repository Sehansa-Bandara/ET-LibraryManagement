# AuraLib — AI Smart Public Library System

A full-stack **AI Smart Public Library System** built with React, FastAPI, Firebase Authentication, Cloud Firestore, and scikit-learn.

---

## 🌟 Key Highlights & Features

### 1. Public Portal
- **Home Page (`/`)**:
  - Hero banner with headline, quick search bar with trending topic suggestions, and CTA buttons.
  - Interactive live library statistics (Catalog Titles, Available Copies, Active Members, AI Match Accuracy).
  - Monthly Featured Books and Community Bestsellers.
  - Category explorer across 7 specialized departments.
  - AI Neural Recommendation promotion section.
- **Book Catalog (`/catalog`)**:
  - Grid of book cards with cover images, availability indicators, rating scores, and tags.
  - Live multi-field search (title, author, keywords, ISBN).
  - Dynamic category pills and stock availability filters ("All", "Available Now").
  - Sorting by Featured, Rating, Publication Year, Title (A-Z / Z-A), and Copies Available.
  - Responsive pagination and empty search states.
- **Book Details Page (`/books/:id`)**:
  - High-res cover with zoom, full metadata (ISBN, publisher, year, pages, language, rating).
  - Availability stock progress bar.
  - **AuraLib AI Executive Takeaway** card explaining key reader gains.
  - "Request to Borrow This Book" action with loan date calculations.
  - Related books carousel in the same discipline.
- **Interactive AI Recommendations (`/recommendations`)**:
  - Persona presets: *Tech Architect*, *Growth Mindset*, *Visionary Leader*, *Curious Polymath*.
  - Multi-select topics of interest across 7 disciplines.
  - Primary outcome goals (Mastery, Habits, Curiosity, Strategy, Wisdom, Escapism).
  - Reading depth preference (Fast-Paced & Concise, Practical & Balanced, Comprehensive Deep Dive).
  - Ranked recommendations with calculated Match Scores (%) and **"Why AuraLib AI Recommends This"** reasoning boxes.
  - Simulated client-side heuristic engine without paid API dependencies.
- **Member Portal: My Books (`/my-books`)**:
  - Tabs: Currently Borrowed, Pending Requests, Borrowing History.
  - Due date tracking and overdue warnings.
  - Interactive "Renew (+7 Days)" action.
  - "Return Book" action with confirmation.
  - "Cancel Pending Request" with automatic queue release.
- **Demo Authentication (`/login`, `/register`)**:
  - Instant 1-click demo logins for both **Member** (`Julian Thorne`) and **Admin / Librarian** (`Dr. Eleanor Vance`).
  - Role switcher pill in the navigation bar to toggle between roles anywhere with 1 click.
  - Form validation with error handling and membership card creation.

---

### 2. Admin / Librarian Dashboard (`/admin`)
- **Dashboard Overview (`/admin`)**:
  - Real-time KPI summary cards: Total Books, Active Members, Currently Borrowed, Overdue Notices, Pending Requests.
  - **Recharts** weekly circulation bar chart (Loans Issued vs Returned Copies).
  - **Recharts** inventory distribution pie chart across all disciplines.
  - High-priority pending requests queue with direct 1-click "Approve" and "Reject" buttons.
  - Recent transactions audit table.
- **Manage Books (`/admin/books`)**:
  - Searchable and filterable catalog table.
  - Add Book modal with input validation.
  - Edit Book modal updating existing records.
  - Delete Book with safety guard against active borrowings.
- **Manage Members (`/admin/members`)**:
  - Member directory with join dates, phone, email, and active loans count.
  - Register new member modal with loan limits.
  - Quick toggle button for member status (Active / Suspended).
  - Remove member action.
- **Borrowing Management (`/admin/borrowings`)**:
  - Filterable by Status: Pending, Approved, Overdue, Returned.
  - Approve pending loans, compute 14-day due dates, and decrement catalog stock consistently.
  - Mark books as returned, closing loans and restoring available copies safely.
- **Borrowing History (`/admin/history`)**:
  - Complete chronological audit log of all borrowing transactions.
  - Search and filter by status and ID.
  - Simulated CSV export.
- **Settings & Profile (`/admin/settings`)**:
  - Chief Librarian profile details (Dr. Eleanor Vance).
  - Library loan duration, max borrowing limits, overdue fine rates, and operating hours.
  - Factory reset button to restore default mock datasets anytime.

---

## 🛠️ Technology Stack
- **Framework**: React.js 19 + Vite 8
- **Styling**: Tailwind CSS v3 with curated navy-blue and brand accent palettes
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Charts**: Recharts
- **Authentication**: Firebase Authentication
- **Cloud database**: Cloud Firestore
- **Backend**: Python FastAPI
- **AI recommendation**: scikit-learn TF-IDF and cosine similarity
- **Collaborative recommendation**: item-based filtering from similar members' borrowing histories
- **Demand prediction**: Random Forest book-demand forecasts for librarians
- **Acquisition advisor**: K-Means analysis of catalogue-search demand, failed searches, stock, and lending activity
- **Duplicate detector**: TF-IDF similarity check before a librarian adds a near-duplicate title

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase and the API

Copy `.env.example` to `.env.local` and fill in the Firebase web-app configuration from Firebase Console. Then follow [the backend setup guide](backend/README.md) to configure the service account and start FastAPI.

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Production Build
```bash
npm run build
```

---

## 🔑 Roles

New registrations are members. To make a librarian, register their account, then set `role` to `admin` in its Firestore `users/{uid}` document, as described in the backend guide. Role selection in the login screen does not grant permissions; the backend enforces the stored role.
