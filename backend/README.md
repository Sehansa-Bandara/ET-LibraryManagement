# AuraLib backend

FastAPI backend using only the required services: **FastAPI**, **Firebase Admin / Firestore**, and **scikit-learn**. It deliberately does not use SQLAlchemy or a separate SQL database.

## Setup

1. Create a Firebase project, enable **Authentication** (Email/Password) and **Cloud Firestore**.
2. In Firebase Console, download a Service Account JSON key. Save it as `backend/serviceAccountKey.json` (this is ignored by Git).
3. Copy `.env.example` to `.env` and update its values if needed.
4. Install and run:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000/docs` for the interactive API documentation.

## Firebase collections

The API creates `books`, `users`, and `borrowings`. The React app should sign users in with Firebase client Auth, then send its ID token with every private request:

```http
Authorization: Bearer <firebase-id-token>
```

The first `POST /users/me` creates that user's member profile. To create the first librarian, set `role: "admin"` manually on their `users/{uid}` Firestore document. Afterwards that librarian can manage books, members, and loan requests through the protected admin endpoints.

`POST /recommendations` is a genuine content-based model: TF-IDF vectorization plus cosine similarity over book title, author, category, tags, description, the user's interests, and previous loans.

## Machine-learning features

`POST /recommendations` now uses a **hybrid recommendation model**. It blends 60% TF-IDF content similarity with 40% item-based collaborative filtering. The collaborative component learns from books borrowed by members whose reading history overlaps with the current member.

`GET /admin/demand-predictions` uses a **Random Forest Regressor** to estimate monthly borrowing demand for every title. It learns from historic loans and book metadata (category, rating, publication year, stock, tags, and description length). With too little borrowing data, it transparently returns a cold-start estimate until enough data exists to train the model.

`POST /search-logs` records settled catalogue searches (query and result count only). `GET /admin/acquisition-advice` clusters those searches with K-Means, evaluates failed searches and available stock, and suggests topics or copies the library should acquire. `POST /admin/books/duplicate-check` uses TF-IDF cosine similarity to flag likely duplicate catalogue entries before they are saved.
