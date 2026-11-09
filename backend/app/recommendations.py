"""Machine-learning services for AuraLib LK."""

from collections import Counter

from sklearn.ensemble import RandomForestRegressor
from sklearn.cluster import KMeans
from sklearn.feature_extraction import DictVectorizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

ACTIVE_LOAN_STATUSES = {"approved", "returned", "overdue"}


def _book_text(book: dict) -> str:
    tags = book.get("tags", [])
    if isinstance(tags, str):
        tags = [tags]
    return " ".join([book.get("title", ""), book.get("author", ""), book.get("category", ""), " ".join(tags), book.get("description", "")])


def _content_scores(available: list[dict], all_books: list[dict], interests: list[str], borrowed_ids: set[str]) -> dict[str, float]:
    profile = " ".join(list(interests) + [_book_text(book) for book in all_books if book.get("id") in borrowed_ids]).strip()
    if not profile:
        return {book["id"]: 0.0 for book in available}
    matrix = TfidfVectorizer(stop_words="english").fit_transform([_book_text(book) for book in available] + [profile])
    scores = cosine_similarity(matrix[-1], matrix[:-1]).flatten()
    return {book["id"]: float(score) for book, score in zip(available, scores)}


def _collaborative_scores(loans: list[dict], user_id: str, candidate_ids: set[str]) -> dict[str, float]:
    """Item-based collaborative filtering based on overlap in members' reading sets."""
    user_books: dict[str, set[str]] = {}
    for loan in loans:
        if loan.get("status") in ACTIVE_LOAN_STATUSES and loan.get("memberId") and loan.get("bookId"):
            user_books.setdefault(loan["memberId"], set()).add(loan["bookId"])
    target_books = user_books.get(user_id, set())
    if not target_books:
        return {}
    scores: Counter = Counter()
    for other_user, other_books in user_books.items():
        if other_user == user_id:
            continue
        union = target_books | other_books
        similarity = len(target_books & other_books) / len(union) if union else 0
        if similarity:
            for book_id in other_books - target_books:
                if book_id in candidate_ids:
                    scores[book_id] += similarity
    maximum = max(scores.values(), default=0)
    return {book_id: value / maximum for book_id, value in scores.items()} if maximum else {}


def recommend(books: list[dict], loans: list[dict], user_id: str, interests: list[str], limit: int) -> list[dict]:
    """Hybrid ML recommender: content similarity (60%) + collaborative filtering (40%)."""
    available = [book for book in books if book.get("availableCopies", 0) > 0]
    borrowed_ids = {loan["bookId"] for loan in loans if loan.get("memberId") == user_id and loan.get("status") in ACTIVE_LOAN_STATUSES}
    candidates = [book for book in available if book["id"] not in borrowed_ids]
    if not candidates:
        return []
    content_scores = _content_scores(candidates, books, interests, borrowed_ids)
    collaborative_scores = _collaborative_scores(loans, user_id, {book["id"] for book in candidates})
    results = []
    for book in candidates:
        content = content_scores.get(book["id"], 0.0)
        collaborative = collaborative_scores.get(book["id"], 0.0)
        quality = (float(book.get("rating") or 0) / 5) * 0.15
        score = (0.60 * content) + (0.40 * collaborative) + quality
        result = dict(book)
        result.update({
            "matchScore": round(min(score, 1) * 100), "contentScore": round(content * 100),
            "collaborativeScore": round(collaborative * 100),
            "reason": "Matches your interests and is popular with readers who borrowed similar books" if collaborative else "Matches your interests, categories, tags, and borrowing history",
        })
        results.append(result)
    return sorted(results, key=lambda book: (book["matchScore"], book.get("rating") or 0), reverse=True)[:limit]


def _demand_features(book: dict) -> dict:
    tags = book.get("tags") or []
    if isinstance(tags, str):
        tags = [tag.strip() for tag in tags.split(",") if tag.strip()]
    return {
        "category": book.get("category", "Uncategorised"), "rating": float(book.get("rating") or 0),
        "year": float(book.get("publicationYear") or 0), "totalCopies": float(book.get("totalCopies") or 1),
        "availabilityRate": float(book.get("availableCopies") or 0) / max(float(book.get("totalCopies") or 1), 1),
        "descriptionLength": float(len(book.get("description") or "")), "tagCount": float(len(tags)),
    }


def predict_demand(books: list[dict], loans: list[dict]) -> list[dict]:
    """Random Forest demand prediction trained using each title's loan history."""
    loan_counts = Counter(loan.get("bookId") for loan in loans if loan.get("status") in ACTIVE_LOAN_STATUSES)
    features, targets = [_demand_features(book) for book in books], [loan_counts.get(book["id"], 0) for book in books]
    model_ready = len(books) >= 3 and len(set(targets)) >= 2
    if model_ready:
        vectorizer = DictVectorizer(sparse=False)
        matrix = vectorizer.fit_transform(features)
        model = RandomForestRegressor(n_estimators=100, random_state=42, min_samples_leaf=1)
        model.fit(matrix, targets)
        predictions = [max(0, float(value)) for value in model.predict(matrix)]
    else:
        predictions = [loan_counts.get(book["id"], 0) + ((float(book.get("rating") or 0) / 5) * 0.5) for book in books]
    results = []
    for book, predicted in zip(books, predictions):
        level = "High" if predicted >= 3 else "Medium" if predicted >= 1 else "Low"
        results.append({"bookId": book["id"], "title": book.get("title", "Untitled"), "predictedMonthlyBorrowings": round(predicted, 1), "demandLevel": level, "historicalBorrowings": loan_counts.get(book["id"], 0), "model": "Random Forest" if model_ready else "Cold-start estimate"})
    return sorted(results, key=lambda item: item["predictedMonthlyBorrowings"], reverse=True)


def find_duplicates(candidate: dict, books: list[dict], threshold: float = 0.62) -> list[dict]:
    """NLP duplicate detection using title, author, and description similarity."""
    if not books:
        return []
    candidate_text = _book_text(candidate)
    corpus = [_book_text(book) for book in books] + [candidate_text]
    try:
        matrix = TfidfVectorizer(stop_words="english").fit_transform(corpus)
    except ValueError:
        return []
    similarities = cosine_similarity(matrix[-1], matrix[:-1]).flatten()
    matches = []
    for book, similarity in zip(books, similarities):
        title_match = candidate.get("title", "").casefold() == book.get("title", "").casefold()
        if similarity >= threshold or title_match:
            matches.append({"bookId": book["id"], "title": book.get("title"), "author": book.get("author"), "similarity": round(float(similarity) * 100)})
    return sorted(matches, key=lambda item: item["similarity"], reverse=True)[:5]


def acquisition_advice(search_logs: list[dict], books: list[dict], loans: list[dict]) -> list[dict]:
    """Cluster real search demand and flag topics underserved by the catalogue."""
    queries = [entry.get("query", "").strip() for entry in search_logs if entry.get("query", "").strip()]
    if not queries:
        return []
    grouped = Counter(query.casefold() for query in queries)
    unique_queries = list(grouped)
    vectorizer = TfidfVectorizer(stop_words="english")
    try:
        matrix = vectorizer.fit_transform(unique_queries)
    except ValueError:
        return []
    cluster_count = min(4, len(unique_queries))
    labels = KMeans(n_clusters=cluster_count, random_state=42, n_init=10).fit_predict(matrix) if cluster_count > 1 else [0]
    loan_counts = Counter(loan.get("bookId") for loan in loans if loan.get("status") in ACTIVE_LOAN_STATUSES)
    book_corpus = [_book_text(book) for book in books]
    suggestions = []
    for cluster_id in set(labels):
        cluster_queries = [query for query, label in zip(unique_queries, labels) if label == cluster_id]
        demand = sum(grouped[query] for query in cluster_queries)
        failed = sum(1 for entry in search_logs if entry.get("query", "").casefold() in cluster_queries and entry.get("resultCount", 0) == 0)
        topic = max(cluster_queries, key=lambda query: grouped[query])
        availability = 0
        catalogue_matches = []
        if book_corpus:
            # Build one shared vocabulary so the topic can be compared to every book.
            combined = TfidfVectorizer(stop_words="english").fit_transform(book_corpus + [topic])
            similarities = cosine_similarity(combined[-1], combined[:-1]).flatten()
            catalogue_matches = [book for book, similarity in zip(books, similarities) if similarity >= 0.15]
            availability = sum(book.get("availableCopies", 0) for book in catalogue_matches)
        score = (demand * 2) + (failed * 3) + sum(loan_counts.get(book["id"], 0) for book in catalogue_matches) - availability
        priority = "High" if score >= 12 else "Medium" if score >= 5 else "Low"
        suggestions.append({"topic": topic.title(), "searches": demand, "failedSearches": failed, "matchingTitles": len(catalogue_matches), "availableCopies": availability, "demandScore": round(score, 1), "priority": priority, "recommendation": f"Acquire additional titles about {topic.title()}" if not catalogue_matches or availability == 0 else f"Consider additional copies or new titles about {topic.title()}"})
    return sorted(suggestions, key=lambda item: item["demandScore"], reverse=True)
