from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, field_validator

Role = Literal["member", "admin"]
BorrowStatus = Literal["pending", "approved", "rejected", "returned", "overdue"]


class BookInput(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    author: str = Field(min_length=1, max_length=150)
    category: str = Field(min_length=1, max_length=80)
    description: str = ""
    tags: list[str] = Field(default_factory=list)
    isbn: str | None = None
    publicationYear: int | None = Field(default=None, ge=0, le=2100)
    totalCopies: int = Field(ge=1, le=10000)
    availableCopies: int | None = Field(default=None, ge=0)
    coverImage: str | None = None
    rating: float | None = Field(default=None, ge=0, le=5)
    reviewsCount: int | None = Field(default=None, ge=0)
    pages: int | None = Field(default=None, ge=1)
    publisher: str | None = None
    language: str | None = None
    featured: bool = False
    popular: bool = False

    @field_validator("tags", mode="before")
    @classmethod
    def convert_tags(cls, value):
        """Accept both API arrays and the comma-separated value used by the admin form."""
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


class BookUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    author: str | None = Field(default=None, min_length=1, max_length=150)
    category: str | None = Field(default=None, min_length=1, max_length=80)
    description: str | None = None
    tags: list[str] | None = None
    isbn: str | None = None
    publicationYear: int | None = Field(default=None, ge=0, le=2100)
    totalCopies: int | None = Field(default=None, ge=1, le=10000)
    availableCopies: int | None = Field(default=None, ge=0)
    coverImage: str | None = None
    rating: float | None = Field(default=None, ge=0, le=5)
    reviewsCount: int | None = Field(default=None, ge=0)
    pages: int | None = Field(default=None, ge=1)
    publisher: str | None = None
    language: str | None = None
    featured: bool | None = None
    popular: bool | None = None

    @field_validator("tags", mode="before")
    @classmethod
    def convert_tags(cls, value):
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


class MemberUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    phone: str | None = None
    address: str | None = None
    avatar: str | None = None
    title: str | None = None
    department: str | None = None
    maxBorrowLimit: int | None = Field(default=None, ge=1, le=20)
    status: Literal["Active", "Suspended"] | None = None


class BorrowRequest(BaseModel):
    bookId: str
    notes: str = Field(default="", max_length=1000)


class RejectRequest(BaseModel):
    reason: str = Field(default="Request denied by administrator", max_length=1000)


class RecommendationRequest(BaseModel):
    interests: list[str] = Field(default_factory=list)
    limit: int = Field(default=8, ge=1, le=20)


class SearchLogInput(BaseModel):
    query: str = Field(min_length=2, max_length=120)
    resultCount: int = Field(ge=0)


class DuplicateCheckRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    author: str = Field(default="", max_length=150)
    description: str = Field(default="", max_length=4000)
