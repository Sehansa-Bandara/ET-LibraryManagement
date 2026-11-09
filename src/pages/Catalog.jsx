import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { BookCard } from '../components/books/BookCard';
import { BookSearchBar } from '../components/books/BookSearchBar';
import { BookFilters } from '../components/books/BookFilters';
import { Pagination } from '../components/common/Pagination';
import { BookOpen, SearchX, Sparkles } from 'lucide-react';
import { apiRequest } from '../lib/api';

export const Catalog = () => {
  const { books } = useLibrary();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search, Category, Availability, Sort state from query or local state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [availability, setAvailability] = useState(searchParams.get('availability') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sync state if URL query params change
  useEffect(() => {
    const qParam = searchParams.get('q');
    const catParam = searchParams.get('category');
    const sortParam = searchParams.get('sort');

    if (qParam !== null) setSearchTerm(qParam);
    if (catParam !== null) setSelectedCategory(catParam);
    if (sortParam !== null) setSortBy(sortParam);
  }, [searchParams]);

  // Update URL params
  const updateQueryParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value && value !== 'All' && value !== 'all') {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      return next;
    });
    setCurrentPage(1);
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    updateQueryParam('q', term);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    updateQueryParam('category', category);
  };

  const handleAvailabilitySelect = (avail) => {
    setAvailability(avail);
    updateQueryParam('availability', avail);
  };

  const handleSortSelect = (sort) => {
    setSortBy(sort);
    updateQueryParam('sort', sort);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setAvailability('all');
    setSortBy('featured');
    setSearchParams({});
    setCurrentPage(1);
  };

  // Filter and Sort Books
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Search filter
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchTitle = book.title.toLowerCase().includes(query);
          const matchAuthor = book.author.toLowerCase().includes(query);
          const matchDesc = (book.description || '').toLowerCase().includes(query);
          const matchIsbn = (book.isbn || '').toLowerCase().includes(query);
          const matchTags = (book.tags || []).some((tag) => tag.toLowerCase().includes(query));
          if (!matchTitle && !matchAuthor && !matchDesc && !matchIsbn && !matchTags) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'All' && book.category !== selectedCategory) {
          return false;
        }

        // Availability filter
        if (availability === 'available' && book.availableCopies <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        if (sortBy === 'newest') {
          return b.publicationYear - a.publicationYear;
        }
        if (sortBy === 'title-asc') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'title-desc') {
          return b.title.localeCompare(a.title);
        }
        if (sortBy === 'copies') {
          return b.availableCopies - a.availableCopies;
        }
        // Default featured
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [books, searchTerm, selectedCategory, availability, sortBy]);

  // Log a settled search once. These anonymised records power the acquisition advisor.
  useEffect(() => {
    const query = searchTerm.trim();
    if (query.length < 2) return undefined;
    const timer = window.setTimeout(() => {
      apiRequest('/search-logs', { method: 'POST', body: { query, resultCount: filteredBooks.length } }).catch(() => {});
    }, 900);
    return () => window.clearTimeout(timer);
  }, [searchTerm, filteredBooks.length]);

  // Pagination slice
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBooks.slice(start, start + itemsPerPage);
  }, [filteredBooks, currentPage, itemsPerPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Public Repository
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight mt-1">
            Library Catalog & Archives
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Explore our curated database of literature, academic papers, and technological guides.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs self-start md:self-auto">
          <BookOpen className="w-4 h-4 text-brand-600" />
          <span>{books.length} Total Books in Catalog</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-3xl">
        <BookSearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search catalog by title, author name, ISBN, or topic..."
        />
      </div>

      {/* Filter Options */}
      <BookFilters
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        availability={availability}
        onSelectAvailability={handleAvailabilitySelect}
        sortBy={sortBy}
        onSelectSortBy={handleSortSelect}
        onReset={handleResetFilters}
      />

      {/* Active filter summary pill */}
      {(searchTerm || selectedCategory !== 'All' || availability !== 'all' || sortBy !== 'featured') && (
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-blue-50/70 px-4 py-2 rounded-xl border border-blue-100">
          <span>Active Filters:</span>
          {selectedCategory !== 'All' && (
            <span className="px-2 py-0.5 bg-white text-navy-900 rounded font-semibold border border-blue-200">
              {selectedCategory}
            </span>
          )}
          {searchTerm && (
            <span className="px-2 py-0.5 bg-white text-navy-900 rounded font-semibold border border-blue-200">
              "{searchTerm}"
            </span>
          )}
          {availability === 'available' && (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
              Available Only
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-brand-600 hover:text-brand-800 font-bold ml-auto underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Books Grid */}
      {paginatedBooks.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
            totalItems={filteredBooks.length}
            itemsPerPage={itemsPerPage}
          />
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-xl mx-auto my-6 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-navy-900">No Matching Books Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            We couldn't find any books matching your current search query or filter combination. Try adjusting keywords or clearing category constraints.
          </p>
          <div className="pt-2">
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition-all"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
