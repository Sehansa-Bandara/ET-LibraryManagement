from datetime import date, timedelta
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import firestore

from .auth import admin_user, current_user
from .config import ALLOWED_ORIGINS, DEFAULT_BORROW_LIMIT, LOAN_DURATION_DAYS
from .firebase import ensure_default_admin, get_db
from .recommendations import acquisition_advice, find_duplicates, predict_demand, recommend
from .schemas import BookInput, BookUpdate, BorrowRequest, DuplicateCheckRequest, MemberUpdate, RecommendationRequest, RejectRequest, SearchLogInput

app = FastAPI(title="AuraLib API", version="1.0.0", description="Firebase-backed API for the AI Smart Public Library System")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def bootstrap_project_data():
    """Provision the first administrator for this classroom prototype."""
    ensure_default_admin()


def document_or_404(collection: str, document_id: str) -> dict:
    snapshot = get_db().collection(collection).document(document_id).get()
    if not snapshot.exists:
        raise HTTPException(status_code=404, detail=f"{collection[:-1].capitalize()} not found")
    return {"id": snapshot.id, **snapshot.to_dict()}


def all_documents(collection: str) -> list[dict]:
    return [{"id": item.id, **item.to_dict()} for item in get_db().collection(collection).stream()]


def refresh_overdue_loans() -> None:
    """Keep loan status accurate whenever loans/dashboard data is requested."""
    today = date.today().isoformat()
    overdue = [loan for loan in all_documents("borrowings") if loan.get("status") == "approved" and loan.get("dueDate") and loan["dueDate"] < today]
    if overdue:
        batch = get_db().batch()
        for loan in overdue:
            batch.update(get_db().collection("borrowings").document(loan["id"]), {"status": "overdue"})
        batch.commit()


def library_settings() -> dict:
    snapshot = get_db().collection("settings").document("library").get()
    return {**DEFAULT_SETTINGS, **(snapshot.to_dict() if snapshot.exists else {})}


@app.get("/health")
def health():
    return {"status": "ok", "service": "AuraLib API"}


# Firebase Auth creates the identity; this endpoint creates/returns the matching profile.
@app.post("/users/me", status_code=status.HTTP_201_CREATED)
def create_or_get_profile(user: dict = Depends(current_user)):
    ref = get_db().collection("users").document(user["uid"])
    existing = ref.get()
    if existing.exists:
        return {"id": existing.id, **existing.to_dict()}
    profile = {
        "name": user.get("name") or user["email"].split("@")[0],
        "email": user["email"],
        "role": "member",
        "status": "Active",
        "maxBorrowLimit": DEFAULT_BORROW_LIMIT,
        "joinedDate": date.today().isoformat(),
        "membershipId": f"AL-{date.today().year}-{uuid4().hex[:6].upper()}",
    }
    ref.set(profile)
    return {"id": user["uid"], **profile}


@app.get("/users/me")
def get_profile(user: dict = Depends(current_user)):
    return document_or_404("users", user["uid"])


@app.patch("/users/me")
def update_own_profile(payload: MemberUpdate, user: dict = Depends(current_user)):
    # Members can only update their own ordinary contact/profile fields.
    allowed = {key: value for key, value in payload.model_dump(exclude_unset=True).items() if key in {"name", "phone", "address", "avatar", "title", "department"}}
    if allowed:
        get_db().collection("users").document(user["uid"]).update(allowed)
    return document_or_404("users", user["uid"])


# Public catalogue -----------------------------------------------------------
@app.get("/books")
def list_books(
    q: str | None = Query(default=None, max_length=100),
    category: str | None = None,
    available_only: bool = False,
):
    books = all_documents("books")
    if q:
        term = q.casefold()
        books = [book for book in books if term in " ".join([book.get("title", ""), book.get("author", ""), book.get("category", ""), book.get("description", ""), " ".join(book.get("tags", []))]).casefold()]
    if category:
        books = [book for book in books if book.get("category", "").casefold() == category.casefold()]
    if available_only:
        books = [book for book in books if book.get("availableCopies", 0) > 0]
    return sorted(books, key=lambda book: book.get("title", "").casefold())


@app.get("/books/{book_id}")
def get_book(book_id: str):
    return document_or_404("books", book_id)


@app.post("/search-logs", status_code=status.HTTP_201_CREATED)
def log_search(payload: SearchLogInput):
    """Anonymous search telemetry used only for acquisition planning."""
    data = {**payload.model_dump(), "createdAt": firestore.SERVER_TIMESTAMP}
    get_db().collection("search_logs").document().set(data)
    return {"recorded": True}


@app.post("/admin/books/duplicate-check")
def duplicate_check(payload: DuplicateCheckRequest, _: dict = Depends(admin_user)):
    return find_duplicates(payload.model_dump(), all_documents("books"))


@app.post("/books", status_code=status.HTTP_201_CREATED)
def add_book(payload: BookInput, _: dict = Depends(admin_user)):
    data = payload.model_dump()
    data["availableCopies"] = data["totalCopies"] if data["availableCopies"] is None else min(data["availableCopies"], data["totalCopies"])
    ref = get_db().collection("books").document()
    ref.set(data)
    return {"id": ref.id, **data}


@app.patch("/books/{book_id}")
def update_book(book_id: str, payload: BookUpdate, _: dict = Depends(admin_user)):
    old = document_or_404("books", book_id)
    changes = payload.model_dump(exclude_unset=True)
    total = changes.get("totalCopies", old["totalCopies"])
    available = changes.get("availableCopies", old["availableCopies"])
    if available > total:
        raise HTTPException(status_code=422, detail="availableCopies cannot exceed totalCopies")
    if total - available < old["totalCopies"] - old["availableCopies"]:
        raise HTTPException(status_code=409, detail="totalCopies cannot be lower than copies currently on loan")
    get_db().collection("books").document(book_id).update(changes)
    return document_or_404("books", book_id)


@app.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: str, _: dict = Depends(admin_user)):
    document_or_404("books", book_id)
    active = [loan for loan in all_documents("borrowings") if loan.get("bookId") == book_id and loan.get("status") in {"pending", "approved", "overdue"}]
    if active:
        raise HTTPException(status_code=409, detail="Book has active borrowing records")
    get_db().collection("books").document(book_id).delete()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Member administration ------------------------------------------------------
@app.get("/members")
def list_members(_: dict = Depends(admin_user)):
    return all_documents("users")


@app.patch("/members/{member_id}")
def update_member(member_id: str, payload: MemberUpdate, _: dict = Depends(admin_user)):
    document_or_404("users", member_id)
    changes = payload.model_dump(exclude_unset=True)
    if changes:
        get_db().collection("users").document(member_id).update(changes)
    return document_or_404("users", member_id)


@app.delete("/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(member_id: str, _: dict = Depends(admin_user)):
    document_or_404("users", member_id)
    active = [loan for loan in all_documents("borrowings") if loan.get("memberId") == member_id and loan.get("status") in {"approved", "overdue"}]
    if active:
        raise HTTPException(status_code=409, detail="Member has active loans")
    get_db().collection("users").document(member_id).delete()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Borrowing workflow ---------------------------------------------------------
@app.get("/borrowings")
def list_borrowings(status_filter: str | None = Query(default=None, alias="status"), user: dict = Depends(current_user)):
    refresh_overdue_loans()
    loans = all_documents("borrowings")
    if user["role"] != "admin":
        loans = [loan for loan in loans if loan.get("memberId") == user["uid"]]
    if status_filter:
        loans = [loan for loan in loans if loan.get("status") == status_filter]
    return sorted(loans, key=lambda loan: loan.get("requestDate", ""), reverse=True)


@app.post("/borrowings", status_code=status.HTTP_201_CREATED)
def request_borrow(payload: BorrowRequest, user: dict = Depends(current_user)):
    if user.get("status") == "Suspended":
        raise HTTPException(status_code=403, detail="Your library account is suspended")
    book = document_or_404("books", payload.bookId)
    if book.get("availableCopies", 0) < 1:
        raise HTTPException(status_code=409, detail="No copies are currently available")
    loans = all_documents("borrowings")
    active = [loan for loan in loans if loan.get("memberId") == user["uid"] and loan.get("status") in {"pending", "approved", "overdue"}]
    if any(loan.get("bookId") == payload.bookId for loan in active):
        raise HTTPException(status_code=409, detail="You already have an active request for this book")
    if len(active) >= user.get("maxBorrowLimit", DEFAULT_BORROW_LIMIT):
        raise HTTPException(status_code=409, detail="Borrowing limit reached")
    data = {
        "bookId": book["id"], "bookTitle": book["title"], "bookAuthor": book["author"],
        "bookCover": book.get("coverImage"), "category": book["category"], "memberId": user["uid"],
        "memberName": user.get("name"), "memberEmail": user["email"], "requestDate": date.today().isoformat(),
        "borrowDate": None, "dueDate": None, "returnDate": None, "status": "pending", "notes": payload.notes,
    }
    ref = get_db().collection("borrowings").document()
    ref.set(data)
    return {"id": ref.id, **data}


@app.post("/borrowings/{borrowing_id}/approve")
def approve_borrow(borrowing_id: str, _: dict = Depends(admin_user)):
    db = get_db()
    loan_ref = db.collection("borrowings").document(borrowing_id)
    @firestore.transactional
    def approve(transaction):
        loan = next(transaction.get(loan_ref), None)
        if not loan or not loan.exists:
            raise HTTPException(status_code=404, detail="Borrowing not found")
        loan_data = loan.to_dict()
        if loan_data.get("status") != "pending":
            raise HTTPException(status_code=409, detail="Only pending requests can be approved")
        book_ref = db.collection("books").document(loan_data["bookId"])
        book = next(transaction.get(book_ref), None)
        if not book or not book.exists or book.to_dict().get("availableCopies", 0) < 1:
            raise HTTPException(status_code=409, detail="No copy is available for approval")
        today = date.today()
        transaction.update(book_ref, {"availableCopies": firestore.Increment(-1)})
        duration = library_settings().get("loanDurationDays", LOAN_DURATION_DAYS)
        transaction.update(loan_ref, {"status": "approved", "borrowDate": today.isoformat(), "dueDate": (today + timedelta(days=duration)).isoformat()})
    approve(db.transaction())
    return document_or_404("borrowings", borrowing_id)


@app.post("/borrowings/{borrowing_id}/reject")
def reject_borrow(borrowing_id: str, payload: RejectRequest, _: dict = Depends(admin_user)):
    loan = document_or_404("borrowings", borrowing_id)
    if loan["status"] != "pending":
        raise HTTPException(status_code=409, detail="Only pending requests can be rejected")
    get_db().collection("borrowings").document(borrowing_id).update({"status": "rejected", "notes": payload.reason})
    return document_or_404("borrowings", borrowing_id)


@app.post("/borrowings/{borrowing_id}/return")
def return_book(borrowing_id: str, user: dict = Depends(current_user)):
    db = get_db()
    loan = document_or_404("borrowings", borrowing_id)
    if user["role"] != "admin" and loan["memberId"] != user["uid"]:
        raise HTTPException(status_code=403, detail="You cannot return this loan")
    if loan["status"] not in {"approved", "overdue"}:
        raise HTTPException(status_code=409, detail="Only active loans can be returned")
    batch = db.batch()
    batch.update(db.collection("borrowings").document(borrowing_id), {"status": "returned", "returnDate": date.today().isoformat()})
    batch.update(db.collection("books").document(loan["bookId"]), {"availableCopies": firestore.Increment(1)})
    batch.commit()
    return document_or_404("borrowings", borrowing_id)


@app.delete("/borrowings/{borrowing_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_pending_request(borrowing_id: str, user: dict = Depends(current_user)):
    loan = document_or_404("borrowings", borrowing_id)
    if loan["memberId"] != user["uid"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="You cannot cancel this request")
    if loan["status"] != "pending":
        raise HTTPException(status_code=409, detail="Only pending requests can be cancelled")
    get_db().collection("borrowings").document(borrowing_id).delete()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.post("/borrowings/{borrowing_id}/renew")
def renew_borrow(borrowing_id: str, user: dict = Depends(current_user)):
    loan = document_or_404("borrowings", borrowing_id)
    if loan["memberId"] != user["uid"]:
        raise HTTPException(status_code=403, detail="You cannot renew this loan")
    if loan["status"] not in {"approved", "overdue"}:
        raise HTTPException(status_code=409, detail="Only active loans can be renewed")
    due = date.fromisoformat(loan["dueDate"]) if loan.get("dueDate") else date.today()
    get_db().collection("borrowings").document(borrowing_id).update({"status": "approved", "dueDate": (due + timedelta(days=7)).isoformat()})
    return document_or_404("borrowings", borrowing_id)


# AI recommendations ---------------------------------------------------------
@app.post("/recommendations")
def recommendations(payload: RecommendationRequest, user: dict = Depends(current_user)):
    books = all_documents("books")
    loans = all_documents("borrowings")
    return recommend(books, loans, user["uid"], payload.interests, payload.limit)


@app.get("/admin/demand-predictions")
def demand_predictions(_: dict = Depends(admin_user)):
    """Inventory planning output from the Random Forest demand model."""
    return predict_demand(all_documents("books"), all_documents("borrowings"))


@app.get("/admin/acquisition-advice")
def get_acquisition_advice(_: dict = Depends(admin_user)):
    """ML-assisted purchase suggestions from search demand, availability, and loans."""
    return acquisition_advice(all_documents("search_logs"), all_documents("books"), all_documents("borrowings"))


@app.get("/admin/dashboard")
def dashboard(_: dict = Depends(admin_user)):
    refresh_overdue_loans()
    books, users, loans = all_documents("books"), all_documents("users"), all_documents("borrowings")
    return {
        "totalBooks": len(books), "availableCopies": sum(book.get("availableCopies", 0) for book in books),
        "activeMembers": len([user for user in users if user.get("role") == "member" and user.get("status") == "Active"]),
        "borrowedBooks": len([loan for loan in loans if loan.get("status") in {"approved", "overdue"}]),
        "pendingRequests": len([loan for loan in loans if loan.get("status") == "pending"]),
        "overdueLoans": len([loan for loan in loans if loan.get("status") == "overdue"]),
    }


DEFAULT_SETTINGS = {
    "libraryName": "AuraLib National Smart Library - Colombo",
    "loanDurationDays": LOAN_DURATION_DAYS,
    "maxBorrowLimit": DEFAULT_BORROW_LIMIT,
    "finePerDay": 20,
    "contactEmail": "support@auralib.lk",
    "operatingHours": "Mon-Sat: 08:00 - 20:00",
}


@app.get("/settings")
def get_settings(user: dict = Depends(current_user)):
    return library_settings()


@app.patch("/settings")
def update_settings(payload: dict, _: dict = Depends(admin_user)):
    allowed = set(DEFAULT_SETTINGS)
    changes = {key: value for key, value in payload.items() if key in allowed}
    if not changes:
        raise HTTPException(status_code=422, detail="No valid settings were supplied")
    get_db().collection("settings").document("library").set(changes, merge=True)
    return get_settings(_)
